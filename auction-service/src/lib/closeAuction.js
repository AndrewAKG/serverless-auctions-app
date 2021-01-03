import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export const closeAuction = async (auction) => {
  let closeAuctionPromises = [];

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED'
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };

  const changeAuctionStatus = dynamodb.update(params).promise();
  closeAuctionPromises.push(changeAuctionStatus);

  const { title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;

  const notifySeller = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: bidder
          ? 'Your item has been sold'
          : 'No bids on your auction item :(',
        recipient: seller,
        body: bidder
          ? `Your item ${title} has been sold for $${amount}`
          : `Oh no! Your item ${title} didn't get any bids. Better luck next time!`
      })
    })
    .promise();
  closeAuctionPromises.push(notifySeller);

  if (bidder) {
    const notifyBidder = sqs
      .sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: 'You won an auction!',
          recipient: bidder,
          body: `What a great deal! You got yourself a ${title} for $${amount}`
        })
      })
      .promise();
    closeAuctionPromises.push(notifyBidder);
  }

  return Promise.all(closeAuctionPromises);
};
