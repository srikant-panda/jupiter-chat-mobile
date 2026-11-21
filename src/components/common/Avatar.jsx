export default function Avatar({ user, size = 36 }) {
  return user?.avatar ? (
    <img
      className="profile-avatar"
      src={user.avatar}
      alt=""
      width={size}
      height={size}
    />
  ) : (
    <span
      className="profile-avatar profile-initial"
      style={{ width: size, height: size }}
    >
      {(user?.name || user?.email || "U")[0].toUpperCase()}
    </span>
  );
}
