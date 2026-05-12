import Swal from 'sweetalert2';

export const sweetMixinErrorAlert = async (message: string, duration = 3000) => {
  await Swal.fire({
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: duration,
  });
};

export const sweetTopSuccessAlert = async (message: string, duration = 2000) => {
  await Swal.fire({
    position: 'center',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: duration,
  });
};
