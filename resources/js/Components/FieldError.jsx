export default function FieldError({ name, errors, className = "", ...props }) {
    return errors[name] ? (
        <p {...props} className={"text-sm text-red-600 " + className}>
            {errors[name][0]}
        </p>
    ) : null;
}
