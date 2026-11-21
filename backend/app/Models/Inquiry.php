<?php

namespace App\Models;

use App\Models\Concerns\HasItinerary;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inquiry extends Model
{
    use HasItinerary;

    public const STATUSES = ['new', 'ongoing', 'quotation_sent', 'converted', 'warm', 'hot'];

    protected $table = 'inquiries';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'location',
        'lead_source',
        'trip',
        'category',
        'pax',
        'nights',
        'travel_date',
        'status',
        'assigned_to_id',
        'assigned_to_name',
        'notes',
        'budget',
        'guests',
        'itinerary_days',
        'freight_details',
    ];

    protected $casts = [
        'pax' => 'integer',
        'nights' => 'integer',
        'travel_date' => 'date:Y-m-d',
        'budget' => 'float',
        'guests' => 'array',
        'freight_details' => 'array',
    ];

    /** Next id in the INQ-1001, INQ-1002 ... series. */
    public static function nextId(): string
    {
        $last = static::query()->where('id', 'like', 'INQ-%')->pluck('id')
            ->map(fn ($id) => (int) substr($id, 4))->max();

        return 'INQ-'.max(1001, ($last ?? 0) + 1);
    }

    public function itineraryKind(): string
    {
        return 'inquiry';
    }

    public function itineraryTripStart(): ?CarbonImmutable
    {
        return $this->travel_date ? CarbonImmutable::parse($this->travel_date) : null;
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(FollowUp::class)->latest('scheduled_at');
    }

    public function resolveFreightDetails(): array
    {
        $stored = $this->freight_details;
        if (is_array($stored) && !empty($stored) && isset($stored['company'])) {
            return $stored;
        }

        $name = $this->customer_name ?: 'Valued Client';
        $companySlug = strtolower(preg_replace('/[^a-z0-9]/i', '', $name)) ?: 'infinityfreight';
        $companyName = !empty($stored['company']['name']) 
            ? $stored['company']['name'] 
            : ($name === 'Subhasis Chatterjee' ? 'Chatterjee Global Logistics Ltd' : ($name === 'Rajesh Sharma' ? 'Al-Maktoum Imports LLC' : ($name . ' Enterprises LLC')));

        $isLead = in_array(strtolower($this->status), ['new', 'contacted', 'qualified', 'opportunity']);
        $leadStages = ['New', 'Contacted', 'Qualified', 'Opportunity', 'Converted'];
        $enquiryStages = ['Received', 'Under Review', 'Quotation Pending', 'Quotation Sent', 'Negotiation', 'Converted'];
        $statusKey = strtolower($this->status);

        $currentStage = 'Under Review';
        if ($isLead) {
            $stageMap = ['new' => 'New', 'ongoing' => 'Contacted', 'warm' => 'Qualified', 'hot' => 'Opportunity'];
            $currentStage = $stageMap[$statusKey] ?? 'New';
        } else {
            $stageMap = ['new' => 'Received', 'ongoing' => 'Under Review', 'warm' => 'Quotation Pending', 'hot' => 'Quotation Sent'];
            $currentStage = $stageMap[$statusKey] ?? 'Quotation Pending';
        }

        $shipDate = $this->travel_date ? CarbonImmutable::parse($this->travel_date)->format('d M Y') : '28 Nov 2026';
        $location = $this->location ?: 'Dubai, UAE (JAFZA)';

        $defaultDetails = [
            'record_type' => $isLead ? 'lead' : 'enquiry',
            'trade_type' => $stored['trade_type'] ?? 'IMPORT',
            'designation' => $stored['designation'] ?? 'Sr. Procurement Manager',
            'subtitle' => $stored['subtitle'] ?? 'Sr. Sales Manager • Company LTD',
            'whatsapp_number' => $stored['whatsapp_number'] ?? ($this->customer_phone ?: '+971 50 482 9104'),
            'preferred_communication' => $stored['preferred_communication'] ?? 'WhatsApp / Email',
            'route' => $stored['route'] ?? 'Mumbai to Dubai',
            'company' => [
                'name' => $companyName,
                'type' => $stored['company']['type'] ?? 'LLC',
                'industry' => $stored['company']['industry'] ?? 'Commercial Electronics',
                'location' => $stored['company']['location'] ?? $location,
                'established_year' => $stored['company']['established_year'] ?? '2012 (12 Years)',
                'main_focus' => $stored['company']['main_focus'] ?? 'Commercial Electronics',
                'email' => $stored['company']['email'] ?? "info@almaktoum-imports.com",
                'phone' => $stored['company']['phone'] ?? '+971 4 881 4000',
                'website' => $stored['company']['website'] ?? "www.almaktoum-imports.com",
                'gst_number' => $stored['company']['gst_number'] ?? '27AABCT3518Q1ZV',
                'iec_number' => $stored['company']['iec_number'] ?? '0304012345',
                'address' => $stored['company']['address'] ?? 'Suite 402, JAFZA One, Jebel Ali Free Zone, Dubai, UAE',
            ],
            'requirements' => [
                'service_type' => $stored['requirements']['service_type'] ?? 'Sea Freight',
                'trade_type' => $stored['requirements']['trade_type'] ?? 'Import',
                'shipment_mode' => $stored['requirements']['shipment_mode'] ?? 'FCL 40ft',
                'container_type' => $stored['requirements']['container_type'] ?? '1x 40ft High Cube (HC)',
                'cargo_description' => $stored['requirements']['cargo_description'] ?? ($this->notes ? substr($this->notes, 0, 80) : 'Electronics & Industrial Machinery parts'),
                'gross_weight' => $stored['requirements']['gross_weight'] ?? '24 Metric Tons (MT)',
                'cargo_classification' => $stored['requirements']['cargo_classification'] ?? 'Electronics & Industrial Machinery parts',
                'storage_env' => $stored['requirements']['storage_env'] ?? 'Ambient dry cargo',
                'barrier_type' => $stored['requirements']['barrier_type'] ?? 'Moisture-resistant desiccant barrier',
                'pol_origin' => $stored['requirements']['pol_origin'] ?? 'JNPT (Mumbai, IN)',
                'pol_sub' => $stored['requirements']['pol_sub'] ?? 'Nhava Sheva Port',
                'transit_duration' => $stored['requirements']['transit_duration'] ?? '4-5 Days',
                'pod_destination' => $stored['requirements']['pod_destination'] ?? 'Jebel Ali (Dubai, UAE)',
                'pod_sub' => $stored['requirements']['pod_sub'] ?? 'Terminal 2 Berth',
                'customs_status' => $stored['requirements']['customs_status'] ?? 'Pending Quote Confirmation',
                'customs_checks' => $stored['requirements']['customs_checks'] ?? [
                    ['label' => 'Country of Origin (COO) legalization by Chamber of Commerce', 'verified' => true],
                    ['label' => 'SASO / UAE MoIAT ECAS product conformity certificate', 'verified' => true],
                    ['label' => 'Dubai Customs duty exemption code pre-lodged', 'verified' => false, 'pending' => true],
                ],
                'delivery_window' => $stored['requirements']['delivery_window'] ?? $shipDate,
                'delivery_sub' => $stored['requirements']['delivery_sub'] ?? 'Must clear Dubai customs for factory installation',
                'incoterms' => $stored['requirements']['incoterms'] ?? 'FOB Origin',
                'incoterms_sub' => $stored['requirements']['incoterms_sub'] ?? 'Pre-carriage by supplier, Ocean freight consignee',
                'customs_clearance' => $stored['requirements']['customs_clearance'] ?? 'Yes — Origin & Destination Ports',
                'special_handling' => $stored['requirements']['special_handling'] ?? 'Temperature Controlled / Fragile / Stackable',
                'additional_instructions' => $stored['requirements']['additional_instructions'] ?? 'Fumigation certificate required. Palletized cargo with shrink wrap.',
            ],
            'short_details' => $this->notes ?: 'Primary POC for import clearances and recurring container shipments across GCC markets. High-priority account requiring expedited customs paperwork for inbound commercial electronics and FOB compliance.',
            'stage' => $stored['stage'] ?? $currentStage,
            'shipment' => $stored['shipment'] ?? [
                'has_shipment' => true,
                'mode_pill' => 'FCL/FCL',
                'container_no' => 'TGHU928310-4',
                'seal_number' => 'SL-884129',
                'vessel_voyage' => 'MSC ALTAIR v.2408W',
                'docs' => [
                    ['id' => 'doc-1', 'name' => 'Commercial Invoice (CI-2026-9042)', 'type' => 'pdf', 'meta' => 'PDF • 1.2 MB • Electronic Stamped', 'status' => 'Verified'],
                    ['id' => 'doc-2', 'name' => 'Ocean Bill of Lading (B/L #MEDU98...)', 'type' => 'doc', 'meta' => 'Draft Approved by Shipper & Consignee', 'status' => 'Verified'],
                    ['id' => 'doc-3', 'name' => 'Certificate of Origin (COO-IN-7721)', 'type' => 'coo', 'meta' => 'Chamber Stamped & Notarized', 'status' => 'Verified'],
                    ['id' => 'doc-4', 'name' => 'Packing List & Weight Certificate...', 'type' => 'scales', 'meta' => 'Awaiting weighbridge slip revision', 'status' => 'Pending Review'],
                    ['id' => 'doc-5', 'name' => 'Inspection Certificate (SGS Clean R...)', 'type' => 'shield', 'meta' => 'Quality seal passed • No discrepancy', 'status' => 'Verified'],
                ],
            ],
            'updates' => $stored['updates'] ?? [
                ['id' => 'up-1', 'title' => 'Customs Clearance Initiated', 'desc' => 'Dubai Customs EDI transaction ID #AE-DXB-98319 accepted.', 'time' => 'Today, 10:45 AM • by Agent Tariq', 'dot' => 'blue'],
                ['id' => 'up-2', 'title' => 'Container Docked at Nhava Sheva (JNPT)', 'desc' => 'Gate-in completed with gross tare weight verification at 24.1 MT.', 'time' => 'Yesterday, 16:20 PM', 'dot' => 'green'],
                ['id' => 'up-3', 'title' => 'FOB Contract Finalized', 'desc' => 'Consignee and supplier approved commercial terms and freight responsibility.', 'time' => '24 Nov 2026, 11:15 AM', 'dot' => 'grey'],
            ],
        ];

        return $defaultDetails;
    }
}
