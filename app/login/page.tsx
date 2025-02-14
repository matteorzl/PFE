"use client";

import { title } from "@/components/primitives";
import React from "react";
import { Form, Input, Button } from "@heroui/react";
import { Logo } from "@/components/icons";

export default function LoginPage() {
  const [action, setAction] = React.useState(null);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <Logo size="200px"/>
        <Form
          className="mt-6 w-full max-w-xs flex flex-col gap-4"
          validationBehavior="native"
          onReset={() => setAction("reset")}
          onSubmit={(e) => {
            e.preventDefault();
            let data = Object.fromEntries(new FormData(e.currentTarget));

            setAction(`submit ${JSON.stringify(data)}`);
          }}
        >
          <Input
            isRequired
            errorMessage="Adresse mail incorrect"
            label="Adresse mail"
            labelPlacement="outside"
            name="email"
            placeholder="Entrer votre adresse mail"
            type="email"
          />

          <Input
            isRequired
            errorMessage="Mot de passe incorrect"
            label="Mot de passe"
            labelPlacement="outside"
            name="username"
            placeholder="Entrez votre mot de passe"
            type="text"
          />

          <div className="flex gap-2">
            <Button color="primary" type="submit">
              Submit
            </Button>
            <Button type="reset" variant="flat">
              Reset
            </Button>
          </div>
          {action && (
            <div className="text-small text-default-500">
              Action: <code>{action}</code>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
