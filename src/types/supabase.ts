export type Profile = {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    rating: number;
    is_online: boolean;
    created_at: string;
    updated_at: string;
};

export type Trip = {
    id: string;
    user_id: string;
    customer_name: string;
    pickup_location: string;
    drop_location: string;
    waste_type: string | null;
    fare: number;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    rating: number | null;
    created_at: string;
    pickup_time: string | null;
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
            profiles: {
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
