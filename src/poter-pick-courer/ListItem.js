import React from "react";
import { Typography } from "@material-ui/core";

const ListItem = ({ title, info, children }) => (
  <div className="item">
    <Typography variant="h6">{title}</Typography>
    {info ? <Typography variant="body1">{info}</Typography> : children}
  </div>
);

export default ListItem;
