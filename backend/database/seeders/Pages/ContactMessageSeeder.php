<?php

namespace Database\Seeders\Pages;

use App\Models\ContactMessage;
use Illuminate\Database\Seeder;

class ContactMessageSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        // name, email, phone, subject, message, destination, start, end, adults, children, interests, existing, status, read, minutes ago, assignee, inquiry
        $rows = [
            ['Priya Mehta', 'priya.mehta@gmail.com', '+91 98200 11234', 'Kashmir trip for 4 in December', 'Hi, we are a family of 4 (2 adults, 2 kids aged 8 and 11) looking at a Kashmir trip from 20 to 26 December. We would like a houseboat stay on Dal Lake and one day at Gulmarg. Could you share a package and the approximate cost?', 'Kashmir', '2026-12-20', '2026-12-26', 2, 2, 'Houseboat, Gulmarg', false, 'new', false, 90, 'Riya Sharma', null],
            ['Rahul Verma', 'rahul.verma@outlook.com', '+91 98765 40012', 'Goa villa for a group of 10', 'Do you have a private pool villa in North Goa for a group of 10 over the long weekend in November? We would also need airport pickup.', 'Goa', '2026-11-13', '2026-11-16', 10, 0, 'Private pool, airport pickup', false, 'new', false, 210, null, null],
            ['Sneha Kapoor', 'sneha.kapoor@gmail.com', '+91 99887 22110', 'Honeymoon package, Maldives or Bali', 'We are getting married in January and want a honeymoon package. Undecided between the Maldives and Bali, can you suggest what suits a 6 night trip?', 'Bali', '2027-01-18', '2027-01-24', 2, 0, 'Beach, spa', false, 'new', false, 1500, null, null],
            ['Arjun Nair', 'arjun.nair@techworks.in', '+91 98450 33221', 'Rishikesh rafting for office team', 'Thanks for the quick reply, we will confirm the head count by Friday. Please hold the camp for 18 people.', 'Rishikesh', '2026-11-22', '2026-11-24', 18, 0, 'Rafting, camping', true, 'replied', true, 1700, 'Aman Joshi', null],
            ['Meera Iyer', 'meera.iyer@gmail.com', '+91 97310 44556', 'Manali snow trip in January', 'We would like a snow trip to Manali in January for two couples. Solang Valley and Atal Tunnel are a must.', 'Manali', '2027-01-10', '2027-01-15', 4, 0, 'Solang Valley, Atal Tunnel', false, 'converted', true, 6000, 'Riya Sharma', 'INQ-1042'],
            ['Vikram Singh', 'vikram.singh@yahoo.com', '+91 98110 55667', 'Rajasthan heritage tour', 'Looking for a 7 day heritage tour covering Jaipur, Jodhpur and Udaipur for my parents.', 'Jaipur', '2026-12-05', '2026-12-12', 2, 0, 'Forts, palaces', true, 'converted', true, 7200, 'Karan Sapalia', 'INQ-1038'],
            ['Seo Offers Ltd', 'sales@seo-offers.biz', null, 'Boost your website ranking now', 'We can put your website on the first page of Google in 7 days. Reply for our special price list.', null, null, null, null, null, null, false, 'spam', false, 7800, null, null],
            ['Karan Sapalia', 'karan@ruyitravel.in', '+91 98200 99001', 'Kerala houseboat for a family', 'Testing the form: we want a Kerala houseboat and Munnar trip for a family of five in February.', 'Kerala', '2027-02-08', '2027-02-14', 3, 2, 'Houseboat, Munnar', true, 'new', true, 3000, null, null],
            ['Aman Joshi', 'aman.joshi@gmail.com', '+91 98011 66778', 'Paragliding in Bir', 'Can we book paragliding in Bir for 6 friends this month? Please share the price per person.', 'Rishikesh', '2026-11-08', '2026-11-09', 6, 0, 'Paragliding', false, 'replied', true, 4400, 'Riya Sharma', null],
            ['Riya Sharma', 'riya.sharma@gmail.com', '+91 98222 77889', 'Bali for our anniversary', 'We are celebrating our 10th anniversary in March and would love a private villa in Ubud with a spa day.', 'Bali', '2027-03-12', '2027-03-18', 2, 0, 'Villa, spa', true, 'new', true, 5200, null, null],
        ];

        foreach ($rows as [$name, $email, $phone, $subject, $message, $destination, $start, $end, $adults, $children, $interests, $existing, $status, $read, $ago, $assignee, $inquiry]) {
            $at = $now->copy()->subMinutes($ago);
            ContactMessage::updateOrCreate(['email' => $email, 'subject' => $subject], [
                'name' => $name, 'phone' => $phone, 'message' => $message, 'source' => 'Website form', 'destination' => $destination,
                'travel_start' => $start, 'travel_end' => $end, 'adults' => $adults, 'children' => $children, 'interests' => $interests,
                'existing_customer' => $existing, 'status' => $status, 'read_at' => $read ? $at->copy()->addMinutes(20) : null,
                'assigned_to_name' => $assignee, 'inquiry_id' => $inquiry, 'created_at' => $at, 'updated_at' => $at,
            ]);
        }
    }
}
