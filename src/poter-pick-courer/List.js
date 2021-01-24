import { Typography } from "@material-ui/core";
import React from "react";
import ListItem from "./ListItem";

const getDateString = (date) => {
  const timeStr = new Date(date).toLocaleTimeString();
  const dateStr = new Date(date).toLocaleDateString();

  return `${timeStr} ${dateStr}`;
};

const getFullName = (firstName, lastName) => `${firstName} ${lastName}`;

const List = ({ courier, manadger, clientInfo, orderInfo, products }) => (
  <React.Fragment>
    <ListItem
      title="Курьер"
      info={courier ? courier.name : "Не выбран курьер"}
    />
    <ListItem
      title="Менеджер"
      info={manadger ? manadger.name : "Не найден менеджер"}
    />
    <ListItem
      title="Клиент"
      info={
        clientInfo
          ? getFullName(clientInfo.firstname, clientInfo.lastname)
          : "Клиент не выбран"
      }
    />
    <ListItem
      title="Время"
      info={orderInfo ? getDateString(orderInfo.dateStart) : "Неизвестно время"}
    />
    <ListItem title="Товары">
      {products.length !== 0 ? (
        <ol>
          {products.map((item) => (
            <li key={item.id}>
              <Typography classes={{ body2: "mui-body2" }} variant="body2">
                <span>{item.name}</span>
                <span>{`${item.count} шт.`}</span>
                <span>x</span>
                <span>{`${item.price} грн.`}</span>
              </Typography>
            </li>
          ))}
        </ol>
      ) : (
        <Typography variant="body2">Не выбран товар</Typography>
      )}
    </ListItem>
    <ListItem
      title="К оплате"
      info={orderInfo ? `${orderInfo.total} грн` : "Не найден заказ"}
    />
  </React.Fragment>
);

export default List;
