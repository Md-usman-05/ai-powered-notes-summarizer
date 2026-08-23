import Swal from "sweetalert2";

export const showSuccess = (title, text = "") => {
    return Swal.fire({
        icon: "success",
        title,
        text,
        confirmButtonText: "Continue",
        confirmButtonColor: "#4f7cff",
        background: "#ffffff",
        color: "#263238",
        borderRadius: "16px",
    });
};

export const showError = (title, text = "") => {
    return Swal.fire({
        icon: "error",
        title,
        text,
        confirmButtonText: "OK",
        confirmButtonColor: "#4f7cff",
        background: "#ffffff",
        color: "#263238",
        borderRadius: "16px",
    });
};

export const showWarning = (title, text = "") => {
    return Swal.fire({
        icon: "warning",
        title,
        text,
        confirmButtonText: "OK",
        confirmButtonColor: "#4f7cff",
        background: "#ffffff",
        color: "#263238",
        borderRadius: "16px",
    });
};

export const showLoading = (title = "Please wait...") => {
    Swal.fire({
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: "#ffffff",
        color: "#263238",
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

export const closeAlert = () => {
    Swal.close();
};