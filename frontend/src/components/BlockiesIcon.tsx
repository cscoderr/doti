import Image from "next/image";
import { useMemo } from "react";
import blockies from "blockies-ts";

const BlockiesIcon = ({
  size,
  address,
  width,
  height,
}: {
  size: number;
  address: `0x${string}`;
  width?: number;
  height?: number;
}) => {
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
export default BlockiesIcon;
