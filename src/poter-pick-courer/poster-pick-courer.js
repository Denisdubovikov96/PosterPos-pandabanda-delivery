import React, { useState, useEffect } from 'react';
import './styles.css';
import Alert from '@material-ui/lab/Alert';

function toArray(arg) {
    const arr = [];
    const len = Object.keys(arg);
    for (let i = 0; i < len.length; i += 1) {
        arr.push(arg[i]);
    }
    return arr;
}

export default function PosterPickCourer() {
    const [allEmployers, setEmloyers] = useState([]);

    const [courier, setCourier] = useState(null);

    const [manadger, setManager] = useState(null);

    const [orderInfo, setOrderInfo] = useState(null);

    const [products, setProducts] = useState([]);

    const [clientInfo, setClientInfo] = useState(null);

    const [requestError, setRequestError] = useState(false);

    useEffect(() => {
        const makeReq = () => {
            Poster.makeApiRequest(
                'access.getEmployees',
                {
                    method: 'get',
                },
                (employees) => {
                    if (employees) {
                        const group = employees;
                        setEmloyers(group);
                    }
                },
            );
        };
        makeReq();
    }, []);
    // добавляем кнопки
    Poster.interface.showApplicationIconAt({
        order: 'Отправить курьеру',
    });
    // событие по клику
    Poster.on('applicationIconClicked', () => {
        Poster.orders.getActive().then((order) => {
            setOrderInfo(order);

            const [choosedCourier] = allEmployers.filter(
                item => item.user_id === order.order.deliveryInfo.courierId,
            );
            setCourier(choosedCourier);

            const [currentManadger] = allEmployers.filter(
                item => item.user_id === order.order.userId,
            );
            setManager(currentManadger);

            const arr = toArray(order.order.products);
            const newArr = arr.map(item => Poster.products.getFullName({ id: item.id }).then((prodName) => {
                const ob = { ...item, name: prodName.name };
                return ob;
            }));
            Promise.all(newArr).then(a => setProducts(a));

            if (order.order.clientId !== 0) {
                Poster.clients.get(order.order.clientId).then((client) => {
                    if (!client) {
                        return;
                    }
                    setClientInfo(client);
                });
            }
        });
        Poster.interface.popup({
            width: 600,
            height: 500,
            title: 'Проверка перед отправкой курьеру',
        });
    });

    const sendToBot = (e) => {
        if (courier === undefined && products.length === 0) {
            e.preventDefault();
        } else {
            const data = new FormData();
            data.append('courier', JSON.stringify(courier));
            data.append('manadger', JSON.stringify(manadger));
            data.append('order', JSON.stringify(orderInfo.order));
            data.append('products', JSON.stringify(products));
            data.append('client', JSON.stringify(clientInfo));

            fetch('https://pogonyalo.com/test/poster/', {
                body: data,
                method: 'POST',
                mode: 'no-cors',
            }).then((resp) => {
                if (resp.status === 0) {
                    setRequestError(false);
                    Poster.interface.closePopup();
                } else {
                    console.log(resp);
                    setRequestError(true);
                }
            });
        }
    };

    return (
        <div className="pick-courier">
            <div className="Alerts">
                {courier === undefined ? (
                    <Alert severity="error">Выберите курьера</Alert>
                ) : null}
                {products.length === 0 ? (
                    <Alert severity="error">Выберите товары</Alert>
                ) : null}
                {requestError ? (
                    <Alert severity="error">Произошла ошибка при отправке</Alert>
                ) : null}
            </div>
            <h5>Курьер</h5>
            <p>{courier ? courier.name : 'Не выбран курьер'}</p>

            <h5>Менеджер</h5>
            <p>{manadger ? manadger.name : 'Не найден менеджер'}</p>

            <h5>Клиент</h5>
            <p>
                {clientInfo
                    ? `${clientInfo.firstname} ${clientInfo.lastname}`
                    : 'клиент не выбран'}
            </p>

            <h5>Время</h5>
            <p>
                {orderInfo
                    ? `${new Date(
                        orderInfo.order.dateStart,
                    ).toLocaleTimeString()} ${new Date(
                        orderInfo.order.dateStart,
                    ).toLocaleDateString()}`
                    : 'неизвестно время'}
            </p>

            <h5>Товары</h5>
            {products.length !== 0 ? (
                <ol>
                    {products.map(item => (
                        <li key={item.id}>
                            <span>{item.name}</span>
                            <span>{`${item.count} шт.`}</span>
                            <span>
                                {' x '}
                                {item.price}
                                {' грн.'}
                            </span>
                        </li>
                    ))}
                </ol>
            ) : (
                <p>Не выбран товар</p>
            )}

            <h5>К оплате</h5>
            <p>{orderInfo ? `${orderInfo.order.total} грн` : 'не найден заказ'}</p>

            <button
                className="btn btn-success"
                type="submit"
                disabled={courier === undefined && products.length === 0}
                onClick={sendToBot}
            >
                Отправить
            </button>
        </div>
    );
}
