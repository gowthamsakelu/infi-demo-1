<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\User;
use App\Support\Permissions;
use Database\Seeders\Pages\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class UsersTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = User::demo();
        $this->actingAs($this->owner);
    }

    private function matrix(array $on = [], array $edit = [], array $delete = []): array
    {
        return collect(array_keys(Permissions::MODULES))->mapWithKeys(fn ($m) => [$m => ['view' => in_array($m, $on) || in_array($m, $edit) || in_array($m, $delete), 'edit' => in_array($m, $edit), 'delete' => in_array($m, $delete)]])->all();
    }

    public function test_the_demo_user_is_an_active_admin_with_full_access(): void
    {
        $this->assertSame(['admin', 'active'], [$this->owner->role, $this->owner->status]);
        foreach (array_keys(Permissions::MODULES) as $m) {
            foreach (Permissions::ACTIONS as $a) {
                $this->assertTrue(Permissions::allows($this->owner, $m, $a), "$m $a");
            }
        }
    }

    public function test_the_list_has_the_team_and_the_seeder_is_repeatable(): void
    {
        $this->seed(UserSeeder::class);
        $this->seed(UserSeeder::class);

        $rows = collect($this->getJson('/api/users')->assertOk()->json('data'));
        $this->assertCount(6, $rows);
        $this->assertSame(['admin' => 1, 'sales' => 3, 'operations' => 2], $rows->countBy('role')->all());
        $this->assertSame('pending', $rows->firstWhere('name', 'Pooja Nair')['status']);
        $this->assertArrayNotHasKey('password', $rows[0]);
    }

    public function test_the_list_is_just_the_owner_when_nobody_else_exists(): void
    {
        $this->assertCount(1, $this->getJson('/api/users')->assertOk()->json('data'));
    }

    public function test_the_detail_has_the_nine_modules_the_stats_and_the_recent_work(): void
    {
        $riya = User::factory()->create(['name' => 'Riya Sharma']);
        Inquiry::create(['id' => 'INQ-1', 'customer_name' => 'A', 'customer_phone' => '1', 'trip' => 'Kashmir', 'status' => 'hot', 'assigned_to_name' => 'Riya Sharma']);
        Inquiry::create(['id' => 'INQ-2', 'customer_name' => 'B', 'customer_phone' => '1', 'trip' => 'Goa', 'status' => 'new', 'assigned_to_name' => 'Riya Sharma']);
        Inquiry::create(['id' => 'INQ-3', 'customer_name' => 'C', 'customer_phone' => '1', 'trip' => 'Goa', 'status' => 'new', 'assigned_to_name' => 'Someone Else']);
        Booking::create(['id' => 'BK-1', 'title' => 'Kashmir', 'type' => 'TOUR', 'pax' => 2, 'status' => 'Paid', 'category' => 'New Bookings', 'raw_price' => 1, 'assigned_to' => ['name' => 'Riya Sharma'], 'start_date' => now()->addDays(5)->toDateString(), 'end_date' => now()->addDays(10)->toDateString()]);
        $old = Booking::create(['id' => 'BK-2', 'title' => 'Old trip', 'type' => 'TOUR', 'pax' => 2, 'status' => 'Paid', 'category' => 'New Bookings', 'raw_price' => 1, 'assigned_to' => ['name' => 'Riya Sharma'], 'start_date' => now()->subDays(45)->toDateString(), 'end_date' => now()->subDays(40)->toDateString()]);
        $old->created_at = now()->subDays(60);
        $old->save();

        $d = $this->getJson("/api/users/{$riya->id}")->assertOk()->json('data');
        $this->assertSame(['openInquiries' => 2, 'converted30d' => 1, 'activeBookings' => 1], $d['stats']);
        $this->assertSame(array_keys(Permissions::MODULES), array_column($d['permissions'], 'module'));
        $this->assertSame(['Inquiries', 'Bookings', 'Calendar', 'Operation Team', 'Destinations and Tour Packages', 'Transport, Stays and Adventures', 'Banners and Blogs', 'Users and Settings'], array_column($d['permissions'], 'label'));
        $this->assertSame('role', $d['permissionsSource']);
        $this->assertTrue($d['editable']);
        $this->assertSame(['inquiries' => [true, true, false], 'website' => [false, false, false]], collect($d['permissions'])->whereIn('module', ['inquiries', 'website'])->mapWithKeys(fn ($p) => [$p['module'] => [$p['view'], $p['edit'], $p['delete']]])->all());
        $this->assertNotEmpty($d['activity']);

        $this->assertFalse($this->getJson("/api/users/{$this->owner->id}")->json('data.editable'), 'an admin or yourself is not editable');
        $this->getJson('/api/users/9999')->assertNotFound();
    }

    public function test_saving_the_matrix_writes_it_and_is_what_the_person_gets_afterwards(): void
    {
        $riya = User::factory()->create();
        $r = $this->putJson("/api/users/{$riya->id}/permissions", ['permissions' => $this->matrix(['website'], ['inquiries'], ['bookings'])])->assertOk();

        $this->assertSame('custom', $r->json('data.permissionsSource'));
        $this->assertTrue(Permissions::allows($riya, 'website', 'view'));
        $this->assertFalse(Permissions::allows($riya, 'website', 'edit'));
        $this->assertTrue(Permissions::allows($riya, 'inquiries', 'edit'));
        $this->assertTrue(Permissions::allows($riya, 'bookings', 'delete'));
        $this->assertFalse(Permissions::allows($riya, 'calendar', 'view'), 'her role default no longer applies once a matrix is saved');
        $this->assertSame(8, \DB::table('user_permissions')->where('user_id', $riya->id)->count());

        $this->putJson("/api/users/{$riya->id}/permissions", ['permissions' => $this->matrix()])->assertOk();
        $this->assertSame(8, \DB::table('user_permissions')->where('user_id', $riya->id)->count(), 'saving again replaces, never duplicates');
    }

    public function test_edit_and_delete_only_count_where_view_is_on(): void
    {
        $riya = User::factory()->create();
        $m = $this->matrix();
        $m['website'] = ['view' => false, 'edit' => true, 'delete' => true];
        $this->putJson("/api/users/{$riya->id}/permissions", ['permissions' => $m])->assertOk();
        $this->assertFalse(Permissions::allows($riya, 'website', 'edit'));
        $this->assertFalse(Permissions::allows($riya, 'website', 'delete'));
    }

    public function test_writes_are_validated(): void
    {
        $riya = User::factory()->create();
        $this->putJson("/api/users/{$riya->id}/permissions", [])->assertUnprocessable()->assertJsonValidationErrors('permissions');
        $short = $this->matrix();
        unset($short['website']);
        $this->putJson("/api/users/{$riya->id}/permissions", ['permissions' => $short])->assertUnprocessable()->assertJsonValidationErrors('permissions.website');
        $bad = $this->matrix();
        $bad['website']['view'] = 'yes please';
        $this->putJson("/api/users/{$riya->id}/permissions", ['permissions' => $bad])->assertUnprocessable();
        $this->patchJson("/api/users/{$riya->id}/status", ['status' => 'pending'])->assertUnprocessable();
        $this->patchJson("/api/users/{$riya->id}/status", [])->assertUnprocessable();
    }

    public function test_admins_and_your_own_access_cannot_be_edited(): void
    {
        $other = User::factory()->admin()->create();
        $this->putJson("/api/users/{$other->id}/permissions", ['permissions' => $this->matrix()])->assertUnprocessable();

        $editor = User::factory()->create();
        Permissions::save($editor, $this->matrix([], ['system']));
        $this->actingAs($editor)->putJson("/api/users/{$editor->id}/permissions", ['permissions' => $this->matrix([], ['system', 'website'])])->assertForbidden();
    }

    public function test_deactivating_sets_the_status_and_locks_the_person_out_of_the_modules(): void
    {
        $riya = User::factory()->create();
        $this->assertTrue(Permissions::allows($riya, 'inquiries', 'view'));

        $this->patchJson("/api/users/{$riya->id}/status", ['status' => 'inactive'])->assertOk()->assertJsonPath('data.status', 'inactive');
        $this->assertSame('inactive', $riya->refresh()->status);
        $this->assertFalse(Permissions::allows($riya, 'inquiries', 'view'));
        $this->actingAs($riya)->getJson('/api/users')->assertForbidden();

        $this->actingAs($this->owner)->patchJson("/api/users/{$riya->id}/status", ['status' => 'active'])->assertOk();
        $this->assertTrue(Permissions::allows($riya->refresh(), 'inquiries', 'view'));
    }

    public function test_you_cannot_deactivate_yourself_or_the_last_admin(): void
    {
        $this->patchJson("/api/users/{$this->owner->id}/status", ['status' => 'inactive'])->assertUnprocessable();

        $lead = User::factory()->create();
        Permissions::save($lead, $this->matrix([], ['system']));
        $this->actingAs($lead)->patchJson("/api/users/{$this->owner->id}/status", ['status' => 'inactive'])->assertUnprocessable()->assertSee('at least one active admin');
    }

    public function test_a_non_admin_without_the_system_module_is_refused_everywhere_on_this_page(): void
    {
        $riya = User::factory()->create();
        $target = User::factory()->create();
        $this->actingAs($riya);
        $this->getJson('/api/users')->assertForbidden();
        $this->getJson("/api/users/{$target->id}")->assertForbidden();
        $this->putJson("/api/users/{$target->id}/permissions", ['permissions' => $this->matrix()])->assertForbidden();
        $this->patchJson("/api/users/{$target->id}/status", ['status' => 'inactive'])->assertForbidden();
    }

    public function test_view_without_edit_can_read_but_not_write(): void
    {
        $viewer = User::factory()->create();
        $target = User::factory()->create();
        Permissions::save($viewer, $this->matrix(['system']));
        $this->actingAs($viewer);
        $this->getJson('/api/users')->assertOk();
        $this->putJson("/api/users/{$target->id}/permissions", ['permissions' => $this->matrix()])->assertForbidden();
    }

    public function test_a_guest_is_turned_away(): void
    {
        auth()->logout();
        $this->getJson('/api/users')->assertUnauthorized();
        $this->getJson('/api/me/permissions')->assertUnauthorized();
    }

    public function test_me_permissions_has_the_module_matrix_and_the_page_map_for_the_shell(): void
    {
        $d = $this->getJson('/api/me/permissions')->assertOk()->json('data');
        $this->assertTrue($d['admin']);
        $this->assertSame(array_keys(Permissions::MODULES), array_keys($d['modules']));
        $this->assertSame(['view' => true, 'edit' => true, 'delete' => true], $d['modules']['system']);
        $this->assertSame(array_keys(Permissions::PAGES), array_keys($d['pages']));
        $this->assertTrue($d['pages']['tour-packages']['view']);

        $riya = User::factory()->create();
        Permissions::save($riya, $this->matrix(['inquiries', 'catalog'], ['bookings']));
        $d = $this->actingAs($riya)->getJson('/api/me/permissions')->json('data');
        $this->assertFalse($d['admin']);
        $this->assertSame('sales', $d['role']);
        $this->assertTrue($d['pages']['destinations']['view'], 'destinations and tour packages are one module');
        $this->assertTrue($d['pages']['tour-packages']['view']);
        $this->assertFalse($d['pages']['transport']['view']);
        $this->assertTrue($d['pages']['bookings']['edit']);
        $this->assertFalse($d['pages']['users']['view']);
        $this->assertTrue($d['pages']['dashboard']['view']);
    }

    public function test_me_permissions_marks_the_person_as_recently_active(): void
    {
        $riya = User::factory()->create(['last_active_at' => now()->subDay()]);
        $this->actingAs($riya)->getJson('/api/me/permissions')->assertOk();
        $this->assertTrue($riya->refresh()->last_active_at->gt(now()->subMinute()));
    }

    public function test_the_gate_and_route_middleware_style_work_for_other_pages(): void
    {
        $riya = User::factory()->create();
        $this->assertTrue(Gate::forUser($riya)->allows('module', ['bookings', 'view']));
        $this->assertFalse(Gate::forUser($riya)->allows('module', ['website', 'view']));
        $this->assertFalse(Gate::forUser($riya)->allows('module', ['no-such-module', 'view']));
        $this->assertFalse(Permissions::allows(null, 'bookings', 'view'));
        $this->assertFalse(Permissions::allows($riya, 'bookings', 'launch'));
    }

    public function test_operations_defaults_differ_from_sales(): void
    {
        $ops = User::factory()->operations()->create();
        $this->assertTrue(Permissions::allows($ops, 'team', 'edit'));
        $this->assertFalse(Permissions::allows($ops, 'inquiries', 'edit'));
        $this->assertTrue(Permissions::allows(User::factory()->create(), 'inquiries', 'edit'));
    }
}
