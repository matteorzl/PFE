import * as Linking from "expo-linking"
import { StripeProvider } from "@stripe/stripe-react-native";

import React, { ReactElement } from "react";

export default function AppStripeProvider({ children }: { children: ReactElement | ReactElement[] }) {
    return (
        <StripeProvider
            publishableKey="pk_test_51Rc0fwC89rIJCFHUgADuNR830yFrl2XUVjXyfxoJ0l5YbuVjn8wW5M9Nd2taaitCKZ7j1E4pDaZbJHIHfX4CEM7M00DUVrb60v"
            merchantIdentifier="acct_1Rc0flC0vfkGizcL"
            urlScheme={Linking.createURL("/")?.split(":")[0]}
        >
           {children}
        </StripeProvider> 
    );
}