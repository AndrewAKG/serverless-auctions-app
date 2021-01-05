# Serverless Auctions House App

`This application was built as a part of a serverless bootcamp course on udemy by codingly. It utilizes serverless framework and microservices approach to achieve the following features and architecture.`

## Architecture

![architecture](https://github.com/AndrewAKG/serverless-auctions-app/blob/master/architecture.PNG)

## Features

### Auctions Service

- User can create an auction
- User can upload an auction picture
- User can see list of all auctions available
- User can place a bid on an auction that's not his.
- Auctions are processed regularly every fixed amount of time to be closed and given to the highest bidder.

### Auth Service

- Each request is authorized using custom lambda function
- Authorization is done using Auth0 and JWT verification.

### Notification Service

- Seller get an email once auction is closed after 1hr of opening the auction.
- Seller get an email indicating the amount of highest bid or no bids on his auction.
- Bidder gets an email indicating that he won an auction if he is the highest bidder.
- Messaging between auctions service and this service is done through AWS SQS messages.
- Emails are send via AWS SES.

## How to use

- clone the repo `git clone https://github.com/AndrewAKG/serverless-auctions-app.git`
- go inside each service and npm install `cd auctions-service`, then `npm install`
- configure a [serverless] profile that have admin access to your AWS account via programmatic access.
- go inside each micro service and `sls deploy -v`
