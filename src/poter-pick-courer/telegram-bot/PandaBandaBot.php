<?php
// бизнес логика телеграм бота
// - настройки типа ID менеджеров для разных типов уведомлений, Групп для уведомлений и пр
// - принимает запрос с внешнего источника типа НОВЫЙ ЗАКАЗ
// - интерактивные кнопки в заказе типа ДОСТАВЛЕНО ОТМЕНЕНО и пр - дублируются
// - парсит полученный обьект
// - диагностика и тестирование (например нет активного курьера или сообщение не доставлено)

//1390566444:AAGX4TgzUybxitgOoPl-1ayw2WboCOckuBg


//1. Можно тестировать бот, но Денис в Постере Курьерам рядом с именем помимо телеграмм логина(опционально) - добавь цифры ID чата в телеграмме (обязательно)
//2. Чтобы получить ID чата пльзователя, зайди в наш чатбот @delivery_pandaban_bot и набери /ncurses_start_color()
//3. Кнопки в сообщении "ДОСТАВЛЕНО" "ОТМЕНЕНО" сделаю завтра
//4. На каждом шаге ведутся логи, так что если что пойдет не так сразу отловим, копии сообщений я тоже получаю, дайте ID кому еще слать для отладки


class PandaBandaBot
{
    public $params, $telegramRequest;


    public function __construct($params)
    {
        $this->params = $params;
        $this->telegramRequest = @json_decode(file_get_contents("php://input"));
        $this->request_incoming();

    }

    public function request_incoming()
    {


        if (isset($_REQUEST['order'])) {
            $this->logs("poster.txt", print_r($_REQUEST, TRUE));
            $this->parseRequest001createMessage();

        } else if ($this->telegramRequest) {
            $this->logs("telegramIncome.txt", print_r($this->telegramRequest, TRUE));
            if ($this->telegramRequest->message->text === "/start") $this->controllerStartButoon();
        }


    }

    private function controllerStartButoon()
    {
        $message = "Сообщите менеджеру для регистрации в системе ваш чат телеграм ID : \n"
            . $this->telegramRequest->message->chat->id;
        $this->logs("myRequest.txt", print_r([$this->telegramRequest->message->chat->id, $message], TRUE));
        $this->telegramSend(
            $this->telegramRequest->message->chat->id,
            $message
        );
    }

    private function parseRequest001createMessage()
    {
        // ОТЛАДКА
        // ОТЛАДКА
        /*$_REQUEST = [
            'courier' => '{"user_id":10,"name":"ЭТО ТЕСТОВЫЕ ДАННЫЕ ИЗ КОДА БОТА (440046277)","login":"","role_name":"Курьер","role_id":12,"user_type":5,"access_mask":2048,"last_in":"0000-00-00 00:00:00","inn":"","name_for_fiscal":""}',
            'manadger' => '{"user_id":4,"name":"Денис","login":"denisdubovikov96@gmail.com","role_name":"root","role_id":5,"user_type":90,"access_mask":2147483647,"last_in":"2020-08-28 14:01:17","inn":"","name_for_fiscal":"Дубов Ден"}',
            'order' => '{"id":1598615972976,"dateStart":1598615972976,"dateClose":0,"datePrint":0,"status":1,"userId":4,"tableId":0,"orderName":111,"guestsCount":1,"serviceMode":3,"processingStatus":10,"products":{"0":{"id":5,"count":6,"price":70,"printedNum":0},"1":{"id":242,"count":2,"price":0,"printedNum":0},"2":{"id":6,"count":2,"price":159.72,"printedNum":0},"3":{"id":375,"count":2,"price":0.01,"printedNum":0},"4":{"id":378,"count":3,"price":0.01,"printedNum":0},"5":{"id":1,"count":2,"price":93,"printedNum":0}},"deliveryInfo":{"city":"","courierId":10,"address1":"","address2":"","billAmount":0,"paymentMethodId":0,"comment":"","deliveryTime":1598619572976,"deliveryZoneId":0,"deliveryPrice":0,"uuid":""},"clientLoyaltyType":2,"subtotal":925.49,"total":925.49,"discount":0,"clientId":2,"payType":"","payedSum":1000,"payedCard":0,"payedCash":1,"payedCert":0,"payedEwallet":0,"payedThirdParty":0,"payedBonus":0,"approvedBonus":0,"platformDiscount":0,"loyaltyAppId":0,"parentId":0,"tipIncluded":0,"tipSum":0,"roundSum":0,"printFiscal":0,"comment":""}',
            'products' => '[{"id":5,"count":6,"price":70,"printedNum":0,"name":"Croissant with chocolate"},{"id":242,"count":2,"price":0,"printedNum":0,"name":"К-сть приборів"},{"id":6,"count":2,"price":159.72,"printedNum":0,"name":"Какой то товар 1"},{"id":375,"count":2,"price":0.01,"printedNum":0,"name":"Cola / Fanta / Sprite до бортиків"},{"id":378,"count":3,"price":0.01,"printedNum":0,"name":"Доставка leaf"},{"id":1,"count":2,"price":93,"printedNum":0,"name":"Borjomi 0.5l"}]',
            'client' => '{"id":2,"firstname":"Денис","lastname":"Дубовиков","patronymic":"","loyaltyType":2,"discount":0,"hidden":0,"groupId":1,"cardNumber":"","bonus":0,"ewallet":0,"useEwallet":false,"totalPayedSum":500,"city":"Житомир","address":"Михайловская, 18","comment":"какой то коментарий карты клиента","phone":"+380 93 111 2222","email":"","birthday":"2000-11-11","governmentId":"","clientSex":1}',
        ];*/

        // ID чата курьера кому шлем мессадж
        preg_match('~([0-9-]{6,15})~', json_decode($_REQUEST['courier'])->name, $match);
        $courierId = $match[1];

        if (!$courierId) {
            // сбой
            $to = $this->params->adminIDChat;
            $this->telegramSend($to, "НЕ вижу ID курьера см. BadRequest.txt");
            $this->logs("BadRequest.txt", print_r($_REQUEST, TRUE));
            die('{"message":"НЕ вижу ID курьера"}');
            exit;
            exit;
            exit;
        }

        // состав
        // состав
        // состав
        $listProducts = "Заказ 🍣🍕 \n";
        foreach (json_decode($_REQUEST['products']) as $item) {
            $listProducts .= "  ✓ " . $item->name . ($item->price ? " (" . $item->price . " грн)" : "") . " - " . $item->count . "шт.\n";
        }

        // сума и способ оплаты
        // сума и способ оплаты
        // сума и способ оплаты
        $price = "";
        //сдача
        $returnMoney = json_decode($_REQUEST['order'])->deliveryInfo->billAmount - json_decode($_REQUEST['order'])->total;
        $returnMoney = $returnMoney > 0 ? "\nCдача: $returnMoney грн." : "";
        //
        $price .= json_decode($_REQUEST['order'])->total ? "К оплате: " . json_decode($_REQUEST['order'])->total . " грн.\n" : "";
        $price .= (json_decode($_REQUEST['order'])->deliveryInfo->paymentMethodId == 1) ? "Тип оплаты: наличные 💵 $returnMoney," : "";
        $price .= (json_decode($_REQUEST['order'])->deliveryInfo->paymentMethodId == 2) ? "Тип оплаты: терминал 💳," : "";
        $price .= (json_decode($_REQUEST['order'])->deliveryInfo->paymentMethodId == 10) ? "Онлайн-оплата🖥," : "";

        // ЭТУ ХРЕНЬ ОТКЛЮЧИТЬ ???????
        // ЭТУ ХРЕНЬ ОТКЛЮЧИТЬ ???????
        // ЭТУ ХРЕНЬ ОТКЛЮЧИТЬ ???????
        //$price .= json_decode($_REQUEST['order'])->discount ? " скидка: " . json_decode($_REQUEST['order'])->discount . " грн.," : "";
        //$price .= json_decode($_REQUEST['order'])->payType ? " тип скидки: " . json_decode($_REQUEST['order'])->payType . "," : "";
        //$price .= json_decode($_REQUEST['order'])->payedCard ? "Тип оплаты: терминал 💳," : "";
        //$price .= json_decode($_REQUEST['order'])->payedCash ? "Тип оплаты: наличные 💵 $returnMoney," : "";
        //$price .= json_decode($_REQUEST['order'])->payedEwallet ? "Онлайн-оплата🖥," : "";
        //$price .= json_decode($_REQUEST['order'])->payedThirdParty ? "Тип оплаты: ДРУГОЕ," : "";
        //
        $price = trim($price, " ,");


        //адрес
        //адрес
        //адрес
        $address =
            //json_decode($_REQUEST['order'])->deliveryInfo->city
            // город не указывают - жестко впишем
            json_decode($_REQUEST['order'])->deliveryInfo->address1;
        //
        $addressComment = json_decode($_REQUEST['order'])->deliveryInfo->address2
            . (json_decode($_REQUEST['order'])->deliveryInfo->comment ? "\nДополнительно: " . json_decode($_REQUEST['order'])->deliveryInfo->comment : "");

        //телефон
        $phone = trim(str_replace(" ", "", json_decode($_REQUEST['client'])->phone));

        /** ПОРЧЯДОК НЕ МЕНЯТЬ
         * // ПОРЧЯДОК НЕ МЕНЯТЬ
         * // ПОРЧЯДОК НЕ МЕНЯТЬ
         * // ПОРЧЯДОК НЕ МЕНЯТЬ **/
        $message = sprintf($this->params->message2courier,
            json_decode($_REQUEST['order'])->orderName,//ID доставки
            json_decode($_REQUEST['courier'])->name,//Курьер имя

            date("Y/m/d H:i", (json_decode($_REQUEST['order'])->dateStart / 1000)), //Дата
            date("Y/m/d H:i", (json_decode($_REQUEST['order'])->deliveryInfo->deliveryTime / 1000)), //Дата


            json_decode($_REQUEST['client'])->firstname . " " . json_decode($_REQUEST['client'])->lastname,
            json_decode($_REQUEST['client'])->comment ? "О клиенте: " . json_decode($_REQUEST['client'])->comment : "",//Комментарий
            $phone,// телефон
            "<a href='https://www.google.com/maps/place/$address, Житомир, Житомирская область'>$address</a>",//Адрес
            $addressComment,

            $listProducts,//список товаров
            $price
        );
        // DEBUG НЕ ОСТАВЛЯЙ НА ВЫВОДЕ имено JSON ниже в отправке идет
        //echo "<pre>$message</pre>";


        // Шлем сообщение
        // Шлем сообщение
        // Шлем сообщение
        $to = $this->params->adminIDChat;
        $to[] = $courierId;
        $this->telegramSend($to, $message);
        $this->logs("myRequest.txt", print_r([$to, $message], TRUE));


    }


    function telegramSend($telegramchatid, $msg)
    {
        $url = 'https://api.telegram.org/bot' . $this->params->APIKey . '/sendMessage';
        $list = [];
        if (!is_array($telegramchatid)) $list[] = $telegramchatid;
        else $list = $telegramchatid;

        foreach ($list as $chatId) {
            $data = [
                'chat_id' => $chatId,
                'text' => $msg,
                'parse_mode' => 'html',
//                'parse_mode' => 'markdown',
                'disable_web_page_preview' => 1
            ];
            $options = ['http' => ['method' => 'POST', 'header' => "Content-Type:application/x-www-form-urlencoded\r\n", 'content' => http_build_query($data),],];
            $context = stream_context_create($options);
            $responce = file_get_contents($url, false, $context);
            //
            $this->logs("telegramResponseOnMyRequest.txt", $responce);
        }

        die('{"message":"Успешно отправлено"}');
        exit;
        exit;
        exit;
    }

    private function logs($filelog_name, $message)
    {
        $fd = fopen(__DIR__ . "/logs/" . $filelog_name, "a");
        fwrite($fd, date("Ymd-G:i:s")
            . " -------------------------------- \n\n" . $message . "\n\n");
        fclose($fd);
    }

}
