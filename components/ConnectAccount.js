import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";

export const ConnectAccount = () => {
  const connectWithMetamask = useMetamask();
  const logout = useDisconnect();
  const address = useAddress();
  return (
    <div className="bg-gray-200 p-2 ">
      {address ? (
        <div>
          <p>
            <span className="font-bold">Connected as</span> {address}
          </p>
          <button className="font-bold text-center" onClick={logout}>
            Logout
          </button>
        </div>
      ) : (
        <button onClick={connectWithMetamask}>Connect Wallet</button>
      )}
    </div>
  );
};
