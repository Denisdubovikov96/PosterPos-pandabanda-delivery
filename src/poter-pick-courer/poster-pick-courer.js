// /* eslint-disable*/
import React, { useState, useEffect, useReducer } from "react";
import "./styles.css";
import Alert from "@material-ui/lab/Alert";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Autocomplete from "@material-ui/lab/Autocomplete";
import date from "date-and-time";
import { toArray } from "./helperFunctions";
import { actions, reducer, initialValues } from "./reducer";
import List from "./List";

function TabPanel({ children, value, tabName, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== tabName}
      id={`wrapped-tabpanel-${tabName}`}
      aria-labelledby={`wrapped-tab-${tabName}`}
      {...other}
    >
      <Box p={2}>{children}</Box>
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `wrapped-tab-${index}`,
    "aria-controls": `wrapped-tabpanel-${index}`,
  };
}

export default function PosterPickCourer() {
  const [state, dispatch] = useReducer(reducer, initialValues);
  const [shownTab, setShownTab] = useState("courier");
  const {
    // spots,
    allEmployers,
    clientInfo,
    courier,
    error,
    manadger,
    orderInfo,
    products: orderProducts,
    tablets,
  } = state;

  // console.log(state);

  const [selectedTablet, setSelectedTablet] = useState(null);
  const [inputValue, setInputValue] = useState("");

  // const [tablets, setTablets] = useState([]);

  // const [currentSpot, setCurrentSpot] = useState(null);
  // const [inputValue2, setInputValue2] = useState("");
  // console.log("tablets", tablets);
  useEffect(() => {
    const makeReq = () => {
      // console.log("GET ___ DATA");
      Poster.makeApiRequest(
        "access.getEmployees",
        {
          method: "get",
        },
        (employees) => {
          if (employees) {
            dispatch(actions.setAllEployers(employees));
          }
        }
      );
      // Poster.makeApiRequest(
      //   "access.getSpots",
      //   {
      //     method: "get",
      //     body: { "1c": true },
      //   },
      //   (respSpots) => {
      //     if (respSpots) {
      //       dispatch(actions.setSpots(respSpots));
      //     }
      //   }
      // );
      Poster.makeApiRequest(
        "access.getTablets",
        {
          method: "get",
        },
        (respTablets) => {
          if (respTablets) {
            dispatch(actions.setTablets(respTablets));
          }
        }
      );
    };
    makeReq();
  }, []);

  // добавляем кнопки
  Poster.interface.showApplicationIconAt({
    order: "Отправить курьеру",
  });
  // событие по клику
  Poster.on("applicationIconClicked", () => {
    Poster.orders.getActive().then(({ order }) => {
      // console.log("HERE");
      // console.log(resp);
      // const { order } = resp;
      dispatch(actions.setOrderInfo(order));

      const [choosedCourier] = allEmployers.filter(
        (item) => item.user_id === order.deliveryInfo.courierId
      );
      dispatch(actions.setCourier(choosedCourier));

      const [currentManadger] = allEmployers.filter(
        (item) => item.user_id === order.userId
      );
      dispatch(actions.setManager(currentManadger));

      const arr = toArray(order.products);
      const newArr = arr.map((item) => {
        const a = Poster.products
          .getFullName({ id: item.id })
          .then((prodName) => {
            const ob = { ...item, name: prodName.name };
            return ob;
          });
        return a;
      });
      Promise.all(newArr).then((a) => {
        dispatch(actions.setProduts(a));
      });

      if (order.clientId !== 0) {
        Poster.clients.get(order.clientId).then((client) => {
          if (!client) {
            return;
          }
          dispatch(actions.setClientInfo(client));
        });
      }
    });
    Poster.interface.popup({
      width: 700,
      height: 600,
      title: "Проверка перед отправкой курьеру или в другое заведение",
    });
  });

  const sendToBot = (e) => {
    if (courier === undefined && orderProducts.length === 0) {
      e.preventDefault();
    } else {
      const data = new FormData();
      data.append("courier", JSON.stringify(courier));
      data.append("manadger", JSON.stringify(manadger));
      data.append("order", JSON.stringify(orderInfo));
      data.append("products", JSON.stringify(orderProducts));
      data.append("client", JSON.stringify(clientInfo));

      fetch("https://telegram-bot.pandabanda.city/", {
        body: data,
        method: "POST",
        mode: "no-cors",
      }).then((resp) => {
        if (resp.status === 0) {
          // console.log("courierRequestStart", resp);
          dispatch(actions.setError("courierRequest", false));
          Poster.interface.closePopup();
          return;
        }
        // console.log("courierRequestError", resp);
        dispatch(actions.setError("courierRequest", true));
      });
    }
  };

  const sendToAnotherSpot = () => {
    const productForRequest = orderProducts.map((item) => {
      if (item.modification) {
        const modification = JSON.parse(item.modification);
        // console.log(modification);
        return { product_id: item.id, count: item.count, modification };
      }
      return { product_id: item.id, count: item.count };
    });
    // const comment = `${orderInfo.comment} (Время доставки заказа ${new Date(
    //   orderInfo.deliveryInfo.deliveryTime
    // ).toLocaleString()})`;
    const comment = `${orderInfo.comment} (Время доставки заказа ${date.format(
      new Date(orderInfo.deliveryInfo.deliveryTime),
      "DD/MM, HH:mm"
    )})`;

    // const sumInKop = orderInfo.total * 100;
    const add =
      orderInfo.deliveryInfo.address1 || orderInfo.deliveryInfo.address2;
    const data = {
      spot_id: selectedTablet.spot_id,
      client_id: clientInfo.id,
      first_name: clientInfo.firstname,
      last_name: clientInfo.lastname,
      phone: clientInfo.phone,
      email: clientInfo.email,
      sex: clientInfo.clientSex,
      birthday: clientInfo.birthday,
      address: add,
      service_mode: orderInfo.serviceMode,
      products: productForRequest,
      comment,
      // payment: {
      //   type: orderInfo.payType,
      //   sum: sumInKop,
      //   currency: "UAH",
      // },
    };
    // console.log("req data", data);
    Poster.makeApiRequest(
      "incomingOrders.createIncomingOrder",
      {
        method: "post",
        contentType: "application/json;charset=utf-8",
        data,
      },
      (resp) => {
        // console.log("spotReqStart", resp);
        if (resp) {
          const currenTablet = tablets.filter(
            (item) => item.spot_id !== selectedTablet.spot_id
          );
          // console.log("currenTablet", currenTablet);
          const dataForClose = {
            spot_tablet_id: currenTablet[0].tablet_id,
            transaction_id: orderInfo.orderName,
            user_id: manadger.user_id,
          };
          // console.log("dataForClose", dataForClose);
          Poster.makeApiRequest(
            "transactions.removeTransaction",
            {
              method: "post",
              contentType: "application/json;charset=utf-8",
              data: dataForClose,
            },
            (succesClose) => {
              // console.log("closeTransactionStart", succesClose);
              if (succesClose) {
                dispatch(actions.setError("closeTransaction", false));
                Poster.interface.closePopup();
                return;
              }
              // console.log("closeTransactionError", resp);
              dispatch(actions.setError("closeTransaction", true));
            }
          );
          return;
        }
        // console.log("spotReqError", resp);
        dispatch(actions.setError("spotRequest", true));
      }
    );
  };

  const tabsChange = (e, newValue) => {
    setShownTab(newValue);
  };
  const isProductsSelected = Boolean(orderProducts.length);
  const isCourierSelected = Boolean(courier);
  const isClientSelected = Boolean(clientInfo);
  const isSpotSelected = Boolean(selectedTablet);
  // const isCurrentSpotSelected = Boolean(currentSpot);

  const courierBtnStatusSuccess = isCourierSelected && isProductsSelected;
  const spotBtnStatusSuccess =
    isClientSelected && isProductsSelected && isSpotSelected;

  return (
    <div className="pick-courier">
      <Tabs value={shownTab} onChange={tabsChange}>
        <Tab
          value="spots"
          label="Отправить в другое заведение"
          {...a11yProps("courier")}
        />
        <Tab
          value="courier"
          label="Отправить курьеру"
          {...a11yProps("spots")}
        />
      </Tabs>
      <TabPanel value={shownTab} tabName="courier">
        <div className="Alerts">
          {!isCourierSelected && (
            <Alert severity="error">Выберите курьера</Alert>
          )}
          {!isProductsSelected && (
            <Alert severity="error">Выберите товары</Alert>
          )}
          {Boolean(error.courierRequest) && (
            <Alert severity="error">Произошла ошибка при отправке</Alert>
          )}
        </div>

        <List
          products={orderProducts}
          courier={courier}
          manadger={manadger}
          clientInfo={clientInfo}
          orderInfo={orderInfo}
        />
        <Button
          classes={{ root: "submit-btn" }}
          style={{ width: "100%", marginTop: 10, padding: "26px 16px" }}
          color="primary"
          variant="contained"
          disabled={!courierBtnStatusSuccess}
          onClick={sendToBot}
        >
          Отправить курьеру
        </Button>
      </TabPanel>

      <TabPanel value={shownTab} tabName="spots">
        <div className="Alerts">
          {!isProductsSelected && (
            <Alert severity="error">Выберите товары</Alert>
          )}
          {Boolean(error.spotRequest) && (
            <Alert severity="error">
              Произошла ошибка при отправке в заведение
            </Alert>
          )}
          {Boolean(error.closeTransaction) && (
            <Alert severity="error">
              Произошла ошибка при закрытии в терминале
            </Alert>
          )}
          {!isClientSelected && (
            <Alert severity="error">Выберите клиента</Alert>
          )}
          {!isSpotSelected && (
            <Alert severity="error">Выберите заведение</Alert>
          )}
          {/* {!isCurrentSpotSelected && (
            <Alert severity="error">
              Если не выбрать текущее заведени прийдется удалять заказ вручную
            </Alert>
          )} */}
          {/* {currentSpot && selectedSpot
            ? currentSpot.spot_id === selectedSpot.spot_id && (
                <Alert severity="warning">
                  Заведении отправитель и заведение получатель совпадают
                </Alert>
              )
            : null} */}
        </div>
        <Autocomplete
          value={selectedTablet}
          id="select-spot"
          style={{ marginBottom: 10, width: "100%" }}
          onChange={(_, newValue) => {
            // console.log(newValue);
            setSelectedTablet(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
          }}
          getOptionLabel={(option) => option.tablet_name}
          options={tablets}
          renderOption={(tablet) => (
            <React.Fragment key={`${tablet.spot_id}-current`}>
              <span>{tablet.tablet_name}</span>
            </React.Fragment>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Заведение получатель"
              variant="outlined"
            />
          )}
        />
        {/* <Autocomplete
          value={currentSpot}
          id="current-spot"
          onChange={(_, newValue) => {
            setCurrentSpot(newValue);
          }}
          inputValue={inputValue2}
          onInputChange={(_, newInputValue) => {
            setInputValue2(newInputValue);
          }}
          getOptionLabel={(option) => option.spot_name}
          options={spots}
          renderOption={(spot) => (
            <React.Fragment key={`${spot.spot_id}-current`}>
              <span>{spot.spot_name}</span>
            </React.Fragment>
          )}
          style={{ width: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Текущее заведение"
              variant="outlined"
            />
          )}
        /> */}
        <List
          products={orderProducts}
          courier={courier}
          manadger={manadger}
          clientInfo={clientInfo}
          orderInfo={orderInfo}
        />
        <Button
          classes={{ root: "submit-btn" }}
          style={{ width: "100%", marginTop: 10, padding: "26px 16px" }}
          color="primary"
          variant="contained"
          disabled={!spotBtnStatusSuccess}
          onClick={sendToAnotherSpot}
        >
          Отправить в заведение
        </Button>
      </TabPanel>
    </div>
  );
}
