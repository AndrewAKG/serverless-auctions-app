import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';
import placeBidSchema from '../lib/schemas/placeBidSchema';
import { getAuctionByIdAsync } from './getAuctionById';
import commonMiddleware from '../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

const placeBid = async (event, context) => {
  let updatedAuction;
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionByIdAsync(id);

  // Bid identity validation
  if (email === auction.seller) {
    throw new createError.Forbidden(`You can not bid on your own auctions!`);
  }

  // Avoid double bidding
  if (email === auction.highestBid.bidder) {
    throw new createError.Forbidden(
      `You are already the highest bidder on this auction.`
    );
  }

  // Auction status validation
  if (auction.status !== 'OPEN') {
    throw new createError.Forbidden(
      `You can not place a bid on closed auctions.`
    );
  }

  // Bid amount validation
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}!`
    );
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamodb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction)
  };
};

export const handler = commonMiddleware(placeBid).use(
  validator({ inputSchema: placeBidSchema })
);
