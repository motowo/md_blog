import React from "react";
import { cardStyles } from "../../constants/styles";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <div className={`${cardStyles.base} ${className}`} {...props}>
      {children}
    </div>
  );
};

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`${cardStyles.header} ${className}`} {...props}>
      {children}
    </div>
  );
};

type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`${cardStyles.body} ${className}`} {...props}>
      {children}
    </div>
  );
};

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`${cardStyles.footer} ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody, CardFooter };
