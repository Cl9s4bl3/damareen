# A program futtatásához egy .env-re van szükség:

```
DATABASE_URL="mysql://username:password@localhost:3306/damareen"
JWT_SECRET=randomkarakterekesbetukcsakascii
```

# Az adatbázisba az alábbi kódot be kell illeszteni a kazamaták típusainak létrehozásához

```
INSERT INTO dungeon_types (name, normal_cards_count, vezer_cards_count, reward_type, reward_description) VALUES
('Egyszerü találkozás', 1, 0, 'damage_plus_1', '+1 sebzés a kiválasztott kártyára'),
('Kis kazamata', 3, 1, 'health_plus_2', '+2 életerö a kiválasztott kártyára'),
('Nagy kazamata', 5, 1, 'damage_plus_3', '+3 sebzés a kiválasztott kártyára');
```
