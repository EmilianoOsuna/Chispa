-- Solo desarrollo local: a dónde llama pg_net para enviar push.
select vault.create_secret('http://supabase_kong_Chispa:8000/functions/v1/push', 'push_url');
select vault.create_secret('c5533e30e47c560c9a8a58ebd1e7ba2a551d9cbafe8429fa', 'push_secret');
