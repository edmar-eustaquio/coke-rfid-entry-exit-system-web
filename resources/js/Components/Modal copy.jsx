export default function Modal({
  children,
  show,
  cancelable,
  onClose,
  className,
}) {
  if (!show) return;

  const onClickOutsideModal = () => {
    if (cancelable) onClose();
  };

  return (
    <div
      onClick={onClickOutsideModal}
      className="fixed inset-0 bg-[rgb(0,0,0,.5)] flex justify-center items-center"
    >
      <div className={`${className} p-5 rounded-lg bg-white shadow-lg`}>
        {children}
      </div>
    </div>
  );
}
