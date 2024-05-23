function Input({
  icon, placeholder, type, onChange,
}) {
  return (
    <div className="uk-margin-small">
      <div className="uk-inline uk-width-1-1">
        <span className="uk-form-icon uk-form-icon-flip" data-uk-icon={`icon: ${icon}`} onChange={onChange} />
        <input className="uk-input uk-border-pill" required placeholder={placeholder} type={type} onChange={onChange} />
      </div>
    </div>
  );
}

export default Input;
