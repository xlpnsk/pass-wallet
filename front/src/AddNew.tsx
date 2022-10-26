import { Formik, Form, Field } from "formik";
import * as React from "react";
import { toast } from "react-toastify";
import { useLocation } from "wouter";
import { UserContext } from "./App";
import * as Yup from "yup";
import http from "./httpService";
import { PasswordModal } from "./PasswordModal";

const AddNewSchema = Yup.object().shape({
  password: Yup.string().min(2, "Too Short!").max(50, "Too Long!"),
  webAddress: Yup.string(),
  description: Yup.string(),
  login: Yup.string(),
});

export const AddNew = () => {
  const {
    login,
    password: masterPassword,
    dispatch,
  } = React.useContext(UserContext);
  const [location, setLocation] = useLocation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const submit = React.useRef<(() => Promise<void>) & (() => Promise<any>)>();
  React.useEffect(() => {
    if (!login) {
      toast("You have to sign in", {
        type: "info",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        progress: undefined,
        theme: "light",
      });
      setLocation("/signin");
    }
  }, []);

  const togglePasswordVisiblility = (
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.preventDefault();

    setPasswordVisible(!passwordVisible);
  };

  function closePasswordModalModal() {
    setIsPasswordModalOpen(false);
  }

  function closePasswordModalModalWithSuccess() {
    setIsPasswordModalOpen(false);
  }

  return (
    <>
      <button
        className="close-btn new-back-btn"
        onClick={() => setLocation("/wallet")}
      >
        Back to wallet
      </button>
      <h2>Add a new record</h2>
      <Formik
        initialValues={{
          password: "",
          webAddress: "",
          description: "",
          login: "",
        }}
        validationSchema={AddNewSchema}
        onSubmit={(values, { setSubmitting, setErrors }) => {
          if (!masterPassword) {
            toast("You have to confirm your master password", {
              type: "warning",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              progress: undefined,
              theme: "light",
            });
            setIsPasswordModalOpen(true);
            return;
          }

          http
            .post(`/wallet`, { ...values, masterPassword: masterPassword })
            .then((resp) => {
              setSubmitting(false);
              toast("Entity added", {
                type: "success",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                progress: undefined,
                theme: "light",
              });
              setLocation("/wallet");
            })
            .catch((err) => {
              if (err.response.status === 401) {
                toast("Provided master password does not match", {
                  type: "error",
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  progress: undefined,
                  theme: "light",
                });
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
        {({ errors, touched, submitForm }) => {
          submit.current = submitForm;
          return (
            <Form>
              <Field name="webAddress" placeholder="Web address" />
              {errors.webAddress && touched.webAddress ? (
                <div className="error">{errors.webAddress}</div>
              ) : null}
              <Field name="login" placeholder="Login" />
              {errors.login && touched.login ? (
                <div className="error">{errors.login}</div>
              ) : null}
              <div className="password-field">
                <Field
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                />
                {errors.password && touched.password ? (
                  <div className="error">{errors.password}</div>
                ) : null}
                <button onClick={togglePasswordVisiblility}>
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
              <Field name="description" placeholder="Description" />
              {errors.description && touched.description ? (
                <div className="error">{errors.description}</div>
              ) : null}
              <button type="submit">Submit</button>
            </Form>
          );
        }}
      </Formik>
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onRequestClose={closePasswordModalModal}
      />
    </>
  );
};
