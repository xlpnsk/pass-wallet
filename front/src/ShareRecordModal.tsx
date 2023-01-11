import { Formik, Form, Field } from "formik";
import ReactModal from "react-modal";
import * as Yup from "yup";
import { UserContext } from "./App";
import http from "./httpService";
import * as React from "react";
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

const ShareSchema = Yup.object().shape({
  login: Yup.string(),
});

interface IShareRecordModal extends ReactModal.Props {
  onRequestClose: () => void;
  recordId: number | null;
}

export const ShareRecordModal: React.FC<IShareRecordModal> = ({
  isOpen,
  onRequestClose,
  style,
  contentLabel,
  recordId,
}) => {
  const {
    login,
    password: masterPassword,
    dispatch,
  } = React.useContext(UserContext);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  const mergedStyles: ReactModal.Styles = {
    content: { ...customStyles.content, ...style?.content },
    overlay: { ...customStyles.overlay, ...style?.overlay },
  };

  function closePasswordModalModal() {
    setIsPasswordModalOpen(false);
  }
  function closePasswordModalModalWithSuccess() {
    setIsPasswordModalOpen(false);
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
        <h2>Share record</h2>
        <Formik
          initialValues={{
            login: "",
          }}
          validationSchema={ShareSchema}
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
              .post(`/wallet/share/${recordId}`, {
                ...values,
                masterPassword: masterPassword,
              })
              .then((resp) => {
                console.log(resp);
                setSubmitting(false);
                if (!resp) return;
                toast("The record has been shared", {
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
                console.log("err", err);
                if (err.response.status === 401) {
                  toast("Provided master password does not match", {
                    type: "error",
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    progress: undefined,
                    theme: "light",
                  });
                } else if (err.response.status === 404) {
                  toast("User with given login does not exist", {
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
              <Field name="login" placeholder="Login" />
              {errors.login && touched.login ? (
                <div className="error">{errors.login}</div>
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
