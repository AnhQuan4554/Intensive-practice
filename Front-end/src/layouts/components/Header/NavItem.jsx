import { NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';

import styles from './Header.module.scss';

const cx = classNames.bind(styles);

function NavItem({ className, title, to, handleClick, isActive, leftIcon }) {
  if (to)
    return (
      <NavLink
        onClick={handleClick}
        className={(props) =>
          cx({
            [className]: className,
            active: props.isActive || isActive,
          })
        }
        to={to}
      >
        <span style={{ marginRight: 8, display: 'flex' }}>{leftIcon ? leftIcon : ''}</span>
        <span>{title}</span>
      </NavLink>
    );
  return (
    <p
      onClick={handleClick}
      className={cx({
        [className]: className,
      })}
    >
      <span style={{ marginRight: 8, display: 'flex' }}>{leftIcon ? leftIcon : ''}</span>
      <span>{title}</span>
    </p>
  );
}

export default NavItem;
