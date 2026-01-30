-- Allow users to insert their own profile
-- This is necessary during registration when the user first creates their profile record.

-- 1. Create a policy that allows INSERT if the ID matches the auth.uid()
-- Use ON CONFLICT DO UPDATE behavior in the app code, so INSERT is key here.
CREATE POLICY "Allow Users to Insert Own Profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 2. Also ensure they can update their own profile later
CREATE POLICY "Allow Users to Update Own Profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Allow them to read their own profile
CREATE POLICY "Allow Users to Select Own Profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);
