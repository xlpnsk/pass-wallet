import { Field, Form, Formik } from "formik";
import * as React from "react";
import { toast } from "react-toastify";
import { useLocation } from "wouter";
import * as Yup from "yup";
import { UserContext } from "./App";
import http from "./httpService";

const SignupSchema = Yup.object().shape({
  login: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  password: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  isPasswordKeptAsHash: Yup.boolean(),
});

export const Register: React.FC = () => {
  const {
    login,
    password: masterPassword,
    dispatch,
  } = React.useContext(UserContext);
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (login) setLocation("/wallet");
  }, []);

  return (
    <div>
      <h2>Sign up</h2>
      <Formik
        initialValues={{ login: "", password: "", isPasswordKeptAsHash: false }}
        validationSchema={SignupSchema}
        onSubmit={(values, { setSubmitting, setErrors }) => {
          setSubmitting(false);
          http
            .post("/auth/register", values)
            .then((resp) => {
              toast("You've successfully signed up", {
                type: "success",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                progress: undefined,
                theme: "light",
              });
              setLocation("/signin");
            })
            .catch((err) => {
              toast("Error occured. Try again later", {
                type: "error",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                progress: undefined,
                theme: "light",
              });
            });
        }}
      >
        {({ errors, touched }) => (
          <Form>
            <Field name="login" />
            {errors.login && touched.login ? (
              <div className="error">{errors.login}</div>
            ) : null}
            <Field name="password" />
            {errors.password && touched.password ? (
              <div className="error">{errors.password}</div>
            ) : null}
            <label className="checkbox-label">
              <Field type="checkbox" name="isPasswordKeptAsHash" />
              isPasswordKeptAsHash?
            </label>
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
