import { Formik, Form, Field } from "formik";
import ReactModal from "react-modal";
import * as Yup from "yup";
import { IJwtToken, UserContext } from "./App";
import http from "./httpService";
import * as React from "react";
import jwt from "jwt-decode";
import "./passwordModal.css";
import { toast } from "react-toastify";

const customStyles: ReactModal.Styles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
  overlay: {},
};

const SigninSchema = Yup.object().shape({
  password: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

interface IPasswordModal<T> extends ReactModal.Props {
  onRequestClose: () => void;
  onRequestCloseWithError?: (extraParams?: T) => void;
  onRequestCloseWithSuccess?: (extraParams?: T) => void;
  extraParams?: T;
}

export const PasswordModal = <T,>({
  isOpen,
  onRequestClose,
  style,
  contentLabel,
  onRequestCloseWithError,
  onRequestCloseWithSuccess,
  extraParams,
}: React.PropsWithChildren<IPasswordModal<T>>) => {
  const { login, dispatch } = React.useContext(UserContext);
  const mergedStyles: ReactModal.Styles = {
    content: { ...customStyles.content, ...style?.content },
    overlay: { ...customStyles.overlay, ...style?.overlay },
  };
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={mergedStyles}
      contentLabel={contentLabel}
    >
      <button className="close-btn" onClick={onRequestClose}>
        ✖
      </button>
      <h2>Enter password</h2>
      <Formik
        initialValues={{ login: login, password: "" }}
        validationSchema={SigninSchema}
        onSubmit={(values, { setSubmitting, setErrors }) => {
          http
            .post("/auth/login", values)
            .then((resp) => {
              setSubmitting(false);
              const tokenData = resp.data;
              if (tokenData) {
                const token = tokenData.access_token;
                window.localStorage.setItem("token", token);
                const tokenLogin = jwt<IJwtToken>(token).login;
                if (login) {
                  dispatch({ type: "setLogin", login: tokenLogin });
                  dispatch({ type: "setPassword", password: values.password });
                }
                toast("Password successfully verified.", {
                  type: "success",
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  progress: undefined,
                  theme: "light",
                });
                typeof onRequestCloseWithSuccess !== "undefined"
                  ? onRequestCloseWithSuccess(extraParams)
                  : onRequestClose();
              }
            })
            .catch((err) => {
              if (err.response.status === 401) {
                onRequestCloseWithError
                  ? onRequestCloseWithError()
                  : setErrors({ password: "Wrong password" });
              } else {
                toast("Error occured. Try again later.", {
                  type: "error",
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  progress: undefined,
                  theme: "light",
                });
              }
            });
        }}
      >
        {({ errors, touched }) => (
          <Form>
            <Field
              name="password"
              type="password"
              placeholder="Master password"
            />
            {errors.password && touched.password ? (
              <div className="error">{errors.password}</div>
            ) : null}
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </ReactModal>
  );
};
