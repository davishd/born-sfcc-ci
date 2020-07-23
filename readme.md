# BORN SFCC CI

The BORN SFCC CI is a command-line interface to interact with your project's Commerce Cloud instances. It provides functionality to facilitate CI/CD practices. This project wraps [Salesforce Commerce Cloud's CLI](https://github.com/SalesforceCommerceCloud/sfcc-ci), the [B2C Commerce Developer Sandbox REST API](https://admin.us01.dx.commercecloud.salesforce.com/), and [OCAPI](https://api-explorer.commercecloud.salesforce.com.).

## Getting Started

In order to perform CLI commands, you have to permit API calls to your Commerce Cloud instances. There are three steps: 1) set up a Commerce Cloud API key through Account Manager (or contact the technical admins on your project for existing API client credentials), 2) configure Open Commerce API Settings, and 3) configure WebDAV Client Permissions.

### Generate Commerce Cloud API Key

In [Account Manager](https://account.demandware.com/dw/account/Home#/), add an API Client for the project and configure:

- Organizations - select your organization.
- Roles - manage the Salesforce Commerce API Access Role permissions
- Default Scopes - include the following scopes

```json
mail
roles
tenantFilter
profile
```

- Redirect URIs - include the following URIs

```json
http://localhost:8080
https://admin.us01.dx.commercecloud.salesforce.com/oauth2-redirect.html
```

### Configure Open Commerce API Settings

1. Log into the Business Manager
2. Navigate to *Administration > Site Development > Open Commerce API Settings*
3. Make sure, that you select *Data API* and *Global* from the select boxes
4. Add the permission set for your client ID to the settings. Make sure to replace `my-client-id` in the provided JSON with your API client ID.

```json
{
      "_v": "19.5",
      "clients":
      [
        {
          "client_id": "my_client_id",
          "resources":
          [
            {
              "resource_id": "/code_versions",
              "methods": ["get"],
              "read_attributes": "(**)",
              "write_attributes": "(**)"
            },
            {
              "resource_id": "/code_versions/*",
              "methods": ["patch", "delete"],
              "read_attributes": "(**)",
              "write_attributes": "(**)"
            },
            {
              "resource_id": "/jobs/*/executions",
              "methods": ["post"],
              "read_attributes": "(**)",
              "write_attributes": "(**)"
            },
            {
              "resource_id": "/jobs/*/executions/*",
              "methods": ["get"],
              "read_attributes": "(**)",
              "write_attributes": "(**)"
            },
            {
              "resource_id": "/sites/*/cartridges",
              "methods": ["post"],
              "read_attributes": "(**)",
              "write_attributes": "(**)"
            },
            {
              "resource_id":"/role_search",
              "methods":["post"],
              "read_attributes":"(**)",
              "write_attributes":"(**)"
            },
            {
              "resource_id":"/roles/*",
              "methods":["get"],
              "read_attributes":"(**)",
              "write_attributes":"(**)"
            },
            {
              "resource_id":"/roles/*/user_search",
              "methods":["post"],
              "read_attributes":"(**)",
              "write_attributes":"(**)"
            },
            {
              "resource_id":"/roles/*/users/*",
              "methods":["put","delete"],
              "read_attributes":"(**)",
              "write_attributes":"(**)"
            },
            {
              "resource_id":"/user_search",
              "methods":["post"],
              "read_attributes":"(**)",
              "write_attributes":"(**)"
            },
            {
              "resource_id":"/users",
              "methods":["get"],
              "read_attributes":"(**)",
              "write_attributes":"(**)"
            },
            {
              "resource_id":"/users/*",
              "methods":["put","get","patch","delete"],
              "read_attributes":"(**)",
              "write_attributes":"(**)"
            }
          ]
        }
      ]
    }
```

### Configure WebDAV Client Permissions

1. Log into the Business Manager
2. Navigate to Administration > Organization > WebDAV Client Permissions
3. Add the permission set (see snippet below) for your client ID to the settings. Make sure to replace `my-client-id` in the provided JSON with your API client ID.

```json
{
      "clients":
      [
        {
          "client_id": "my_client_id",
          "permissions":
          [
            {
              "path": "/impex",
              "operations": [
                "read_write"
              ]
            },
            {
              "path": "/cartridges",
              "operations": [
                "read_write"
              ]
            },
            {
              "path": "/static",
              "operations": [
                "read_write"
              ]
            },
            {
              "path": "/catalogs/<your-catalog-id>",
              "operations": [
                "read_write"
              ]
            },
            {
              "path": "/libraries/<your-library-id>",
              "operations": [
                "read_write"
              ]
            },
            {
              "path": "/dynamic/<your-site-id>",
              "operations": [
                "read_write"
              ]
            }
          ]
        }
      ]
    }
```

---

## Installation and Project Setup

### Install the NPM package

BORN SFCC CI is an NPM package. It can be installed with the command:

```bash
npm install @borngroup/born-sfcc-ci --save-dev
```

### Create a dw.json

BORN SFCC CI requires a valid *dw.json* in the root directory. The *dw.json* provides the credentials and environmental setting needed to issue commands against your Commerce Cloud instances.

*dw.json*

```json
{

    "username": "account-manager-email@borngroup.com",
    "password": "account-manager-password!123",
    "client-id": "project-cicd-client-id",
    "client-secret": "project-cicd-client-secret",
    "hostname": "my-instance.sandbox.us01.dx.commercecloud.salesforce.com",
    "version": "myversion",
    "data-bundle": "sandbox",
	  "data-hostnames": ["my-instance01.com", "my-instance02.com"] // added for usage by the technical lead; can be omitted by developers.
}
```
*dw.json* properties
- username: Your SFCC Account Manager username. This is required.
- password: Your SFCC Account Manager password. This is required
- client-id: A valid Commerce Cloud API client id which will be provided by a technical admin (most likely the TL of your project).
This is required for code activation and data deployment.
- client-secret: A valid Commerce Cloud API client secret which will be provided by an technical admin (most likely the TL of your project). This is required for code activation and data deployment.
- hostname: The hostname of your Commerce Cloud instance. This is required.
- version: Your code version. Typically, your first initial + last name i.e., jdoe. This is required for code activation and upload.
- data-bundle: A data bundle to deploy. The available data bundles are defined in site_data/config.json. Each bundle references a set of data directories to upload and import into your instance. This is required for data deployment.
- data-hostnames: An array of hostnames pointing to  Commerce Cloud instances. This allows deployment to multiple instances at once. This is an optional property for TL usage and should be removed to avoid accidental data deployments to other sandoxes than your own.

### Configure site_data

BORN SFCC CI uses the *site_data* directory in the root directory for data deployment.

See https://bitbucket.org/borngroup/sfcc-accelerators/src/master/site_template/readme.md

## Usage

BORN SFCC CI accepts a single `task` argument in order to specify the routine.

### Tasks

**Activate Code**

Activate a code version specified in your *dw.json* on your Commerce Cloud instance. This can be useful when beginning development to ensure your code version is active.

```bash
born-sfcc-ci --task=activate-code
```

**Deploy Data**

Compress, upload, and import a set of data archives to your Commerce Cloud instance. Using the *dw.json*'s `data-bundle` property, this command identifies and deploys the corresponding data folders in the *site_data/config.json* file.

```bash
born-sfcc-ci --task=deploy-data
```