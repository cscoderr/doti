import Image from "next/image";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import blockies from "blockies-ts";

const UserIcon = ({
  size,
  width,
  height,
}: {
  size: number;
  width?: number;
  height?: number;
}) => {
  const { address } = useAccount();

  const icon = useMemo(
    () =>
      blockies
        .create({
          seed: address,
        })
        .toDataURL(),
    [address]
  );

  return (
    <Image
      height={width ?? size}
      width={height ?? size}
      src={icon}
      alt="User Image"
      className={`rounded-full w-${size} h-${size}`}
    />
  );
};
export default UserIcon;
