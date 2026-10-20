<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Staff;
use App\Models\Vendor;
use App\Models\Contact;
use App\Models\Booking;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Staff
        $staffFile = database_path('data/staff.json');
        if (file_exists($staffFile)) {
            $staffData = json_decode(file_get_contents($staffFile), true);
            foreach ($staffData as $item) {
                Staff::updateOrCreate(
                    ['id' => $item['id']],
                    [
                        'name' => $item['name'],
                        'role' => $item['role'],
                        'phone' => $item['phone'],
                        'avatar' => $item['avatar'] ?? null,
                        'active_trips' => $item['activeTrips'] ?? 0,
                    ]
                );
            }
        }

        // 2. Seed Vendors
        $vendorsFile = database_path('data/vendors.json');
        if (file_exists($vendorsFile)) {
            $vendorsData = json_decode(file_get_contents($vendorsFile), true);
            foreach ($vendorsData as $item) {
                Vendor::updateOrCreate(
                    ['id' => $item['id']],
                    [
                        'name' => $item['name'],
                        'phone' => $item['phone'],
                        'service' => $item['service'],
                        'image' => $item['image'] ?? null,
                        'selected' => $item['selected'] ?? false,
                    ]
                );
            }
        }

        // 3. Seed Contacts
        $contactsFile = database_path('data/contacts.json');
        if (file_exists($contactsFile)) {
            $contactsData = json_decode(file_get_contents($contactsFile), true);
            foreach ($contactsData as $item) {
                Contact::updateOrCreate(
                    ['id' => $item['id']],
                    [
                        'name' => $item['name'],
                        'phone' => $item['phone'],
                        'role' => $item['role'],
                        'details' => $item['details'] ?? null,
                        'avatar' => $item['avatar'] ?? null,
                    ]
                );
            }
        }

        // 4. Seed Bookings
        $bookingsFile = database_path('data/bookings.json');
        if (file_exists($bookingsFile)) {
            $bookingsData = json_decode(file_get_contents($bookingsFile), true);
            foreach ($bookingsData as $item) {
                Booking::updateOrCreate(
                    ['id' => $item['id']],
                    [
                        'title' => $item['title'],
                        'type' => $item['type'] ?? 'TOUR',
                        'type_class' => $item['typeClass'] ?? 'badge-tour',
                        'image' => $item['image'] ?? null,
                        'pax' => $item['pax'] ?? count($item['guests'] ?? [1]),
                        'duration' => $item['duration'] ?? '',
                        'dates' => $item['dates'] ?? '',
                        'travel_date_full' => $item['travelDateFull'] ?? '',
                        'status' => $item['status'] ?? 'Pending',
                        'status_class' => $item['statusClass'] ?? 'status-pending',
                        'price' => $item['price'] ?? '₹0',
                        'raw_price' => $item['rawPrice'] ?? 0,
                        'category' => $item['category'] ?? 'New Bookings',
                        'destination' => $item['destination'] ?? '',
                        'booking_type' => $item['bookingType'] ?? 'Tour Package',
                        'services' => $item['services'] ?? '',
                        'assigned_status' => $item['assignedStatus'] ?? 'Unassigned',
                        'notes' => $item['notes'] ?? '',
                        'customer' => $item['customer'] ?? null,
                        'assigned_to' => $item['assignedTo'] ?? null,
                        'special_requirements' => $item['specialRequirements'] ?? [],
                        'guests' => $item['guests'] ?? [],
                        'itinerary_days' => $item['itineraryDays'] ?? [],
                    ]
                );
            }
        }
    }
}
