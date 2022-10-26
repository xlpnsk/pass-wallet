import { Formik, Form, Field } from "formik";
import * as React from "react";
import { UserContext } from "./App";
import * as Yup from "yup";
import http from "./httpService";
import { toast } from "react-toastify";

const ChangePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  newPassword: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

export const Account: React.FC = () => {
  const {
    login,
    password: masterPassword,
    dispatch,
  } = React.useContext(UserContext);
  return (
    <>
      <h2>Change password</h2>
      <Formik
        initialValues={{ oldPassword: "", newPassword: "" }}
        validationSchema={ChangePasswordSchema}
        onSubmit={(values, { setSubmitting, setErrors }) => {
          http
            .put("/auth/password", values)
            .then((resp) => {
              setSubmitting(false);
              toast("Your password has been changed!", {
                type: "success",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                progress: undefined,
                theme: "light",
              });
              dispatch({ type: "resetPassword" });
            })
            .catch((err) => {
              if (err.response.status === 401) {
                setErrors({ oldPassword: "Wrong password" });
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
              name="oldPassword"
              type="password"
              placeholder="Current password"
            />
            {errors.oldPassword && touched.oldPassword ? (
              <div className="error">{errors.oldPassword}</div>
            ) : null}
            <Field
              name="newPassword"
              type="password"
              placeholder="New password"
            />
            {errors.newPassword && touched.newPassword ? (
              <div className="error">{errors.newPassword}</div>
            ) : null}
            <button type="submit">Submit</button>
          </Form>
        )}
      </Formik>
    </>
  );
};
