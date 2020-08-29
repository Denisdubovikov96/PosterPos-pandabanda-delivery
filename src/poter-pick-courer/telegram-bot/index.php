<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");


require __DIR__ . "/PandaBandaBot.php";

$params = new stdClass();
$params->APIKey = '1390566444:AAGX4TgzUybxitgOoPl-1ayw2WboCOckuBg';
$params->adminIDChat = ['440046277'];

$params->message2courier = "🚗 Заказ №%s 
Курьер: %s

Открыто: %s
Доставить: %s

Клиент: %s
%s
Телефон 📞: %s
Адрес доставки: %s
%s

%s
%s";


$pp = new PandaBandaBot($params);




/* заметки

t.me/delivery_pandaban_bot

https://api.telegram.org/bot1390566444:AAGX4TgzUybxitgOoPl-1ayw2WboCOckuBg/setwebhook?url=https://pogonyalo.com/test/poster/
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
*/
