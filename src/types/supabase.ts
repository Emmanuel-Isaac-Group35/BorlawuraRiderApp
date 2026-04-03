export type Profile = {
    id: string;
    email: string | null;
    phone: string | null;
    phone_number: string | null;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    language: string | null;
    rider_license_number: string | null;
    avatar_url: string | null;
    license_photo_url: string | null;
    ghana_card_photo_url: string | null;
    vehicle_photo_url: string | null;
    rating: number;
    total_trips: number;
    is_online: boolean;

    created_at: string;
    updated_at: string;
};

export type Trip = {
    id: string;
    user_id: string;
    rider_id: string | null;
    customer_name: string | null;
    address: string | null;
    pickup_location: string | null;
    drop_location: string | null;
    waste_type: string | null;
    waste_size: string | null;
    amount: number | null;
    fare: number | null;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    sub_status: string | null;
    notes: string | null;
    rating: number | null;
    distance_value: number | null;
    pickup_latitude: number | null;
    pickup_longitude: number | null;
    drop_latitude: number | null;
    drop_longitude: number | null;
    created_at: string;
    pickup_time: string | null;
    accepted_at: string | null;
    completed_at: string | null;
};

export type Transaction = {
    id: string;
    user_id: string;
    type: 'earning' | 'withdrawal' | 'bonus';
    amount: number;
    description: string | null;
    status: 'completed' | 'pending' | 'failed';
    created_at: string;
};

export type AuditLog = {
    id: string;
    user_id: string | null;
    action: string;
    details: any | null;
    ip_address: string | null;
    created_at: string;
};

export type Database = {
    public: {
        Tables: {
            riders: {
                Row: Profile;
                Insert: Partial<Profile>;
                Update: Partial<Profile>;
            };
            trips: {
                Row: Trip;
                Insert: Partial<Trip>;
                Update: Partial<Trip>;
            };
            transactions: {
                Row: Transaction;
                Insert: Partial<Transaction>;
                Update: Partial<Transaction>;
            };
            audit_logs: {
                Row: AuditLog;
                Insert: Partial<AuditLog>;
                Update: Partial<AuditLog>;
            };
        };
    };
};
