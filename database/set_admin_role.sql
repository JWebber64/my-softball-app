-- Replace with your actual user ID (it will look something like: 'd4c7b3f0-b9a9-4b51-b2c4-b5b9a9b5b9a9')
SELECT set_user_role('90d3805f-3578-45cf-b78a-87c3882c249c', 'team-admin');

-- Verify the role was set
SELECT * FROM public.user_roles WHERE user_id = '90d3805f-3578-45cf-b78a-87c3882c249c';
SELECT raw_app_metadata FROM auth.users WHERE id = '90d3805f-3578-45cf-b78a-87c3882c249c';
