/* eslint-disable */

export const actionTypes = {
  // SET_SPOTS: "SET_SPOTS",
  SET_ALL_EMPLOYERS: "SET_ALL_EMPLOYERS",
  SET_COURIER: "SET_COURIER",
  SET_MANADGER: "SET_MANADGER",
  SET_PRODUCTS: "SET_PRODUCTS",
  SET_CLIENT_INFO: "SET_CLIENT_INFO",
  SET_ORDER_INFO: "SET_ORDER_INFO",
  ERROR: "ERROR",
  SET_TABLETS: "SET_TABLETS",
};

export const initialValues = {
  spots: [],
  allEmployers: null,
  courier: null,
  manadger: null,
  orderInfo: null,
  products: [],
  clientInfo: null,
  error: {},
  tablets: [],
};

export const reducer = (state, { type, payload }) => {
  switch (type) {
    // case actionTypes.SET_SPOTS:
    //   return {
    //     ...state,
    //     spots: payload,
    //   };
    case actionTypes.SET_TABLETS:
      return {
        ...state,
        tablets: payload,
      };
    case actionTypes.SET_ORDER_INFO:
      return {
        ...state,
        orderInfo: payload,
      };
    case actionTypes.SET_ALL_EMPLOYERS:
      return {
        ...state,
        allEmployers: payload,
      };
    case actionTypes.SET_COURIER:
      return {
        ...state,
        courier: payload,
      };
    case actionTypes.SET_MANADGER:
      return {
        ...state,
        manadger: payload,
      };
    case actionTypes.SET_PRODUCTS:
      return {
        ...state,
        products: payload,
      };
    case actionTypes.SET_CLIENT_INFO:
      return {
        ...state,
        clientInfo: payload,
      };
    case actionTypes.ERROR:
      return {
        ...state,
        error: { ...state.error, ...payload },
      };

    default:
      return state;
  }
};

// const setSpots = (spots) => {
//   return {
//     type: actionTypes.SET_SPOTS,
//     payload: spots,
//   };
// };

const setAllEployers = (employers) => {
  return {
    type: actionTypes.SET_ALL_EMPLOYERS,
    payload: employers,
  };
};

const setCourier = (courier) => {
  return {
    type: actionTypes.SET_COURIER,
    payload: courier,
  };
};

const setManager = (manager) => {
  return {
    type: actionTypes.SET_MANADGER,
    payload: manager,
  };
};

const setProduts = (products) => {
  return {
    type: actionTypes.SET_PRODUCTS,
    payload: products,
  };
};

const setClientInfo = (clientInfo) => {
  return {
    type: actionTypes.SET_CLIENT_INFO,
    payload: clientInfo,
  };
};

const setError = (key, value) => {
  return {
    type: actionTypes.ERROR,
    payload: { [key]: value },
  };
};

const setOrderInfo = (order) => {
  return {
    type: actionTypes.SET_ORDER_INFO,
    payload: order,
  };
};

const setTablets = (tablets) => {
  return {
    type: actionTypes.SET_TABLETS,
    payload: tablets,
  };
};

export const actions = {
  // setSpots,
  setAllEployers,
  setCourier,
  setManager,
  setProduts,
  setClientInfo,
  setError,
  setOrderInfo,
  setTablets,
};
