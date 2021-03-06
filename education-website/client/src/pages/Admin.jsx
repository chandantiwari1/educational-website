import { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import { Flex, Heading, Button } from "@chakra-ui/react";
import { useSelector } from "react-redux";

import Layout from "../layouts/Admin";

import useLogout from "../hooks/useLogout";

import config from "../config";

// pages
import Categories from "../components/Admin/Categories";
import Packages from "../components/Admin/Packages";
import Users from "../components/Admin/Users";
import Organizations from "../components/Admin/Organizations";
import Questions from "../components/Admin/Questions";
import Alc from "../components/Admin/Alc";
import SendMails from "../components/Admin/SendMails";
import UploadFiles from "../components/Admin/UploadFiles";
import DefaultSettings from "../components/Admin/DefaultSettings";
import Converter from "../components/Admin/Converter";

const Admin = () => {
  const { user } = useSelector((state) => state.authReducer);
  const { path } = useRouteMatch();
  const logout = useLogout();

  useEffect(() => {
    document.title = `${config.appName} - Admin dashboard`;
  }, []);

  if (!user.verified) {
    return (
      <Flex w="full" h="100vh" justify="center" align="center" direction="column">
        <Heading fontSize="2xl" color="red.400" mb={3}>
          Sign Up
        </Heading>
        <Heading w="full" maxW="400px" fontSize="md" textAlign="center" fontWeight="normal" mb={3}>
          Please check your emails to confirm your registration. If you do not find an email from us
          please look into your spam.
        </Heading>
        <Heading mb={3} fontSize="md" color="GrayText" fontWeight="normal">
          {user.email}
        </Heading>
        <Button colorScheme="blue" onClick={logout}>
          Log Out
        </Button>
      </Flex>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path={path} exact component={Categories} />
        <Route path={`${path}/packages`} component={Packages} />
        <Route path={`${path}/users`} component={Users} />
        <Route path={`${path}/organizations`} component={Organizations} />
        <Route path={`${path}/alc`} component={Alc} />
        <Route path={`${path}/uploadFiles`} component={UploadFiles} />
        <Route path={`${path}/converter`} component={Converter} />
        <Route path={`${path}/settings`} component={DefaultSettings} />
        <Route path={`${path}/:categoryId/questions`} component={Questions} />
        <Route path={`${path}/sendMails`} component={SendMails} />
      </Switch>
    </Layout>
  );
};

export default Admin;
