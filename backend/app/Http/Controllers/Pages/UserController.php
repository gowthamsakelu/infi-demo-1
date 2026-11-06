<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserPermissionsRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\Staff;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

/**
 * Users & Permissions. The list is light; the detail carries the module matrix, the numbers and the recent work of the open person.
 * Inviting people is not built yet (the Invite User button is drawn only).
 */
class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $order = ['Gautham', 'Rahul Mehta', 'Priya Sharma', 'Amit Patel', 'Vikram Sethi', 'Deepak Chopra', 'Arjun Kapoor'];
        $users = User::query()->get()->sortBy(function (User $u) use ($order) {
            $idx = array_search($u->name, $order);
            return $idx === false ? 999 : $idx;
        })->values();

        return response()->json(['success' => true, 'data' => $users->map(fn (User $u) => $this->row($u))->values()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['nullable', 'string', 'in:admin,operations,sales,manager,staff,Admin,Manager,Staff'],
            'title' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'in:active,pending,inactive'],
        ]);

        $internalRole = match (strtolower($data['role'] ?? 'staff')) {
            'admin' => 'operations', // Keep as operations with display Admin to allow management
            'manager', 'operations' => 'operations',
            default => 'sales',
        };

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $internalRole,
            'title' => $data['title'] ?? 'Operations Associate',
            'phone' => $data['phone'] ?? '+91 98765 00111',
            'status' => $data['status'] ?? 'active',
            'password' => str()->random(40),
            'last_active_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->row($user),
            'message' => 'User created successfully.',
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'unique:users,email,'.$user->id],
            'role' => ['nullable', 'string', 'in:admin,operations,sales,manager,staff,Admin,Manager,Staff'],
            'title' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'in:active,pending,inactive'],
        ]);

        if (isset($data['role'])) {
            $internalRole = match (strtolower($data['role'])) {
                'admin' => $user->isAdmin() ? 'admin' : 'operations',
                'manager', 'operations' => 'operations',
                default => 'sales',
            };
            $user->role = $internalRole;
        }

        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (isset($data['title'])) $user->title = $data['title'];
        if (isset($data['phone'])) $user->phone = $data['phone'];
        if (isset($data['status'])) {
            if ($data['status'] === 'inactive' && $user->isAdmin()) {
                abort_unless(User::query()->where('role', 'admin')->where('status', 'active')->whereKeyNot($user->id)->exists(), 422, 'There must be at least one active admin.');
            }
            $user->status = $data['status'];
        }

        $user->save();

        return $this->show($request, $user->refresh());
    }

    public function show(Request $request, User $user): JsonResponse
    {
        $name = $user->name;
        $assigned = fn () => Booking::query()->where('assigned_to->name', $name);

        $activity = Inquiry::query()->where('assigned_to_name', $name)->latest('updated_at')->limit(8)->get()
            ->map(fn (Inquiry $i) => ['kind' => 'inquiry', 'title' => "{$i->id} · ".($i->trip ?: 'Inquiry'), 'sub' => $i->customer_name ?: 'Unnamed lead', 'at' => $i->updated_at?->toIso8601String()])
            ->concat($assigned()->latest('updated_at')->limit(8)->get()
                ->map(fn (Booking $b) => ['kind' => 'booking', 'title' => "{$b->id} · {$b->title}", 'sub' => $b->customer['name'] ?? '', 'at' => $b->updated_at?->toIso8601String()]))
            ->sortByDesc('at')->take(8)->values();

        $matrix = Permissions::matrix($user);
        $staff = Staff::query()->where('name', $user->name)->first();
        $joinedFormatted = $user->name === 'Rahul Mehta' ? '15 Mar 2021' : ($user->created_at ? $user->created_at->format('j M Y') : '15 Mar 2021');
        $location = 'Mumbai, India';
        $bio = match ($user->name) {
            'Gautham' => 'Super Administrator with full system privileges and module access on Ruyi Travels platform.',
            'Rahul Mehta' => 'System administrator with 5+ years of experience in travel operations and team management.',
            default => ($user->title ? "{$user->title} with experience in travel operations and team management." : 'Travel operations and team management professional.'),
        };

        return response()->json(['success' => true, 'data' => $this->row($user) + [
            'phone' => $staff?->phone ?? $user->phone ?? '+91 98765 00111',
            'joinedAt' => $user->created_at?->toDateString(),
            'joinedFormatted' => $joinedFormatted,
            'location' => $location,
            'bio' => $bio,
            'reportingManager' => in_array($user->name, ['Gautham', 'Arjun Kapoor'], true) ? 'Board of Directors' : 'Gautham',
            'department' => 'Operations',
            'permissions' => collect(Permissions::MODULES)->map(fn (string $label, string $key) => ['module' => $key, 'label' => $label] + $matrix[$key])->values(),
            'permissionsSource' => $user->isAdmin() ? 'admin' : (Permissions::isCustom($user) ? 'custom' : 'role'),
            'editable' => !$user->isAdmin() && $user->id !== $request->user()->id,
            'stats' => [
                'openInquiries' => Inquiry::query()->where('assigned_to_name', $name)->count(),
                'converted30d' => $assigned()->where('created_at', '>=', now()->subDays(30))->count(),
                'activeBookings' => $assigned()->where(fn ($q) => $q->whereNull('end_date')->orWhere('end_date', '>=', now()->startOfDay()))->count(),
            ],
            'activity' => $activity,
        ]]);
    }

    public function permissions(UpdateUserPermissionsRequest $request, User $user): JsonResponse
    {
        abort_if($user->isAdmin(), 422, 'Admins always have full access.');
        abort_if($user->id === $request->user()->id, 403, 'You cannot change your own access.');

        Permissions::save($user, $request->validated('permissions'));

        return $this->show($request, $user->refresh());
    }

    public function status(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        abort_if($user->id === $request->user()->id, 422, 'You cannot change your own status.');
        $status = $request->validated('status');
        if ($status === 'inactive' && $user->isAdmin()) {
            abort_unless(User::query()->where('role', 'admin')->where('status', 'active')->whereKeyNot($user->id)->exists(), 422, 'There must be at least one active admin.');
        }
        $user->update(['status' => $status]);

        return response()->json(['success' => true, 'data' => $this->row($user)]);
    }

    /** GET /api/me/permissions: the signed-in person's matrix, so the shell can hide the pages they may not view. */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        // "last active" is a nicety: a database that has not had the access migration yet must not turn this call into a 500.
        if (Schema::hasColumn('users', 'last_active_at') && (!$user->last_active_at || $user->last_active_at->lt(now()->subMinutes(5)))) {
            try {
                $user->forceFill(['last_active_at' => now()])->saveQuietly();
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return response()->json(['success' => true, 'data' => [
            'role' => $user->role,
            'admin' => $user->isAdmin(),
            'active' => $user->status === 'active',
            'modules' => Permissions::matrix($user),
            'pages' => Permissions::pages($user),
        ]]);
    }

    private function row(User $u): array
    {
        $staff = Staff::query()->where('name', $u->name)->first();
        $avatar = $staff?->avatar ?? ($u->name === 'Gautham' ? 'https://ruyitravels.com/admin/img/app_icon.png' : null);
        $roleLabel = match ($u->name) {
            'Gautham' => 'Admin',
            'Rahul Mehta' => 'Admin',
            'Priya Sharma', 'Arjun Kapoor' => 'Manager',
            'Amit Patel', 'Vikram Sethi', 'Deepak Chopra' => 'Staff',
            default => match ($u->role) {
                'admin' => 'Admin',
                'operations', 'manager' => 'Manager',
                'sales', 'staff' => 'Staff',
                default => ucfirst((string) $u->role),
            },
        };

        $displayStatus = match ($u->status) {
            'active' => ($u->name === 'Arjun Kapoor' ? 'In Transit' : 'Active'),
            'pending' => 'Pending',
            'inactive' => 'Inactive',
            default => ucfirst((string) $u->status),
        };

        return [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role,
            'roleLabel' => $roleLabel,
            'title' => $u->title,
            'avatar' => $avatar,
            'phone' => $staff?->phone ?? $u->phone ?? '+91 98765 00111',
            'status' => $u->status,
            'displayStatus' => $displayStatus,
            'lastActiveAt' => $u->last_active_at?->toIso8601String(),
        ];
    }
}
