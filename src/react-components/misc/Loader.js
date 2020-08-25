import React from "react";
import PropTypes from "prop-types";
import styles from "./Loader.scss";
import Spinger from "../../assets/spinger.gif"

export function Loader({ message }) {
  return (
    <>
      <div className={styles.loader}>
        <div />
        <div />
        <div />
      </div>
      {message && <div className={styles.loaderText}>{message}</div>}
    </>
  );
}

Loader.propTypes = {
  message: PropTypes.string
};
