import { Field, Form, Formik } from "formik";
import * as React from "react";
import * as Yup from "yup";
import { IJwtToken, UserContext } from "./App";
import http from "./httpService";
import jwt from "jwt-decode";
import { useLocation } from "wouter";
import { toast } from "react-toastify";

const SigninSchema = Yup.object().shape({
  login: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  password: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

export const Login: React.FC = () => {
  const { login, dispatch } = React.useContext(UserContext);
  const [location, setLocation] = useLocation();
  return (
    <div>
      <h2>Sign in</h2>
      <Formik
        initialValues={{ login: "", password: "" }}
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
                const login = jwt<IJwtToken>(token).login;
                login && dispatch({ type: "setLogin", login: login });
                toast("You've successfully logged in.", {
                  type: "success",
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  progress: undefined,
                  theme: "light",
                });
                setLocation("/wallet");
              }
            })
            .catch((err) => {
              console.log(err);
              if (err.response.status === 401) {
                toast(
                  err.response.data.message || "Invalid login or password.",
                  {
                    type: "error",
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    progress: undefined,
                    theme: "light",
                  }
                );
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
            <Field name="login" />
            {errors.login && touched.login ? (
              <div className="error">{errors.login}</div>
            ) : null}
            <Field name="password" type="password" />
            {errors.password && touched.password ? (
              <div className="error">{errors.password}</div>
            ) : null}
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
