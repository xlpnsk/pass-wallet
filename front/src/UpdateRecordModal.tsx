import { Formik, Form, Field } from "formik";
import ReactModal from "react-modal";
import * as Yup from "yup";
import { UserContext } from "./App";
import http from "./httpService";
import * as React from "react";
import { IPassword, IRecord } from "./Wallet";
import { PasswordModal } from "./PasswordModal";
import "./updateModal.css";
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

const UpdateSchema = Yup.object().shape({
  password: Yup.string().min(2, "Too Short!").max(50, "Too Long!"),
  webAddress: Yup.string(),
  description: Yup.string(),
  login: Yup.string(),
});

interface IUpdateRecordModal extends ReactModal.Props {
  onRequestClose: () => void;
  recordData: IRecord | null;
  updateRecord: (id: number, data: IRecord) => void;
}

interface IUpdateRecordDto {
  id: string | number;
  masterPassword: string;
  password?: string;
  webAddress: string;
  description: string;
  login: string;
}

export const UpdateRecordModal: React.FC<IUpdateRecordModal> = ({
  isOpen,
  onRequestClose,
  style,
  contentLabel,
  recordData,
  updateRecord,
}) => {
  const {
    login,
    password: masterPassword,
    dispatch,
  } = React.useContext(UserContext);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [password, setPassword] = React.useState<IPassword | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  const togglePasswordVisiblility = (
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.preventDefault();
    if (!masterPassword) {
      setIsPasswordModalOpen(true);
      return;
    }
    if (passwordVisible) {
      setPasswordVisible(false);
      return;
    }
    if (!!!recordData) {
      return;
    }

    http
      .post(`/wallet/${recordData.id}`, {
        password: masterPassword,
      })
      .then((resp) => {
        const passwordRecord: IPassword = resp.data;
        setPasswordVisible(true);
        !password && setPassword(passwordRecord);
      })
      .catch((err) => {
        setIsPasswordModalOpen(true);
      });
  };

  const mergedStyles: ReactModal.Styles = {
    content: { ...customStyles.content, ...style?.content },
    overlay: { ...customStyles.overlay, ...style?.overlay },
  };

  function closePasswordModalModal() {
    setIsPasswordModalOpen(false);
  }
  function closePasswordModalModalWithSuccess() {
    setIsPasswordModalOpen(false);
    togglePasswordVisiblility();
  }
  return (
    <>
      <ReactModal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        style={mergedStyles}
        contentLabel={contentLabel}
      >
        <button className="close-btn" onClick={onRequestClose}>
          ✖
        </button>
        <h2>Update record</h2>
        <Formik
          initialValues={{
            id: recordData ? recordData.id : "",
            password: "      ",
            webAddress: recordData?.webAddress ? recordData.webAddress : "",
            description: recordData?.description ? recordData.description : "",
            login: recordData?.login ? recordData.login : "",
          }}
          validationSchema={UpdateSchema}
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

            const updateDataArr = Object.entries(values).map(
              ([key, value], idx) => {
                const newValue =
                  typeof value === "string"
                    ? value.trim().length === 0
                      ? recordData
                        ? [key]
                        : value
                      : value
                    : value;
                return [key, newValue];
              }
            );
            const updateDataTemp: IUpdateRecordDto =
              Object.fromEntries(updateDataArr);
            let updateData: IUpdateRecordDto;
            if (values.password.trim().length === 0) {
              const { password, ...rest } = updateDataTemp;
              updateData = rest;
            } else {
              updateData = { ...updateDataTemp };
            }

            http
              .put(`/wallet/${values.id}`, {
                ...updateData,
                masterPassword: masterPassword,
              })
              .then((resp) => {
                setSubmitting(false);
                const upRecord: IRecord = {
                  id:
                    typeof updateData.id === "string"
                      ? parseInt(updateData.id)
                      : updateData.id,
                  webAddress: updateData.webAddress,
                  description: updateData.description,
                  login: updateData.login,
                };
                updateRecord(upRecord.id, upRecord);
                toast("Entity updated", {
                  type: "success",
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  progress: undefined,
                  theme: "light",
                });
                onRequestClose();
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
          {({ errors, touched, values }) => (
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
                  value={
                    passwordVisible
                      ? values.password.trim().length === 0
                        ? password?.password
                        : values.password
                      : "      "
                  }
                  disabled={!passwordVisible}
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
          )}
        </Formik>
      </ReactModal>
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onRequestClose={closePasswordModalModal}
        onRequestCloseWithSuccess={closePasswordModalModalWithSuccess}
      />
    </>
  );
};
