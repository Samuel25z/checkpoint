-- Apaga os perfis de demonstração (e tudo deles: perfil e quem segue quem saem junto).
delete from auth.users where email like '%@demo.checkpoint';
