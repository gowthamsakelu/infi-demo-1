<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserPermissionsRequest;
use App\Http\Requests\UpdateUserStatusRequest;
use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Users & Permissions. The list is light; the detail carries the module matrix, the numbers and the recent work of the open person.
 * Inviting people is not built yet (the Invite User button is drawn only).
 */
class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => User::query()->orderBy('id')->get()->map(fn (User $u) => $this->row($u))->values()]);
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

        return response()->json(['success' => true, 'data' => $this->row($user) + [
            'phone' => $user->phone,
            'joinedAt' => $user->created_at?->toDateString(),
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
        if (!$user->last_active_at || $user->last_active_at->lt(now()->subMinutes(5))) {
            $user->forceFill(['last_active_at' => now()])->saveQuietly();
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
        return [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role,
            'roleLabel' => User::ROLES[$u->role] ?? ucfirst((string) $u->role),
            'title' => $u->title,
            'status' => $u->status,
            'lastActiveAt' => $u->last_active_at?->toIso8601String(),
        ];
    }
}
