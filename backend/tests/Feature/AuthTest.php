<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_is_sent_to_the_sign_in_page(): void
    {
        $this->get('/')->assertRedirect('/login');
        $this->get('/livewire')->assertRedirect('/login');
        $this->get('/login')->assertOk()->assertSee('Sign in')->assertSee('Press to log in');
    }

    public function test_one_press_signs_in_and_creates_the_demo_person_once(): void
    {
        $this->post('/login/demo')->assertRedirect('/');
        $this->assertAuthenticated();
        $this->assertSame(1, User::count());
        $this->assertSame(config('auth.demo_name'), User::first()->name);

        $this->post('/logout')->assertRedirect('/login');
        $this->assertGuest();
        $this->post('/login/demo');
        $this->assertSame(1, User::count());
        $this->get('/')->assertOk();
    }

    public function test_the_demo_button_can_be_turned_off(): void
    {
        config(['auth.demo_login' => false]);

        $this->get('/login')->assertOk()->assertDontSee('Press to log in');
        $this->post('/login/demo')->assertNotFound();
        $this->assertGuest();
    }

    public function test_email_and_password_sign_in(): void
    {
        $user = User::create(['name' => 'Asha', 'email' => 'asha@example.com', 'password' => 'correct-horse']);

        $this->post('/login', ['email' => 'asha@example.com', 'password' => 'wrong'])->assertSessionHasErrors('email');
        $this->assertGuest();

        $this->post('/login', ['email' => 'asha@example.com', 'password' => 'correct-horse'])->assertRedirect('/');
        $this->assertAuthenticatedAs($user);
        $this->assertNotSame('correct-horse', $user->fresh()->password, 'the password is stored hashed');
    }

    public function test_a_signed_in_user_does_not_see_the_sign_in_page_again(): void
    {
        $this->actingAs(User::create(['name' => 'Asha', 'email' => 'a@example.com', 'password' => 'x-long-password']))->get('/login')->assertRedirect();
    }

    public function test_the_login_form_validates_its_input(): void
    {
        $this->post('/login', [])->assertSessionHasErrors(['email', 'password']);
        $this->post('/login', ['email' => 'not-an-email', 'password' => 'x'])->assertSessionHasErrors('email');
    }
}
