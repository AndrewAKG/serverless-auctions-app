import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: process.env.SES_REGION });

const sendMail = async (event, context) => {
  const record = event.Records[0];
  console.log('record processing', record);

  const email = JSON.parse(record.body);
  const { subject, body, recipient } = email;

  const params = {
    Source: process.env.SES_SOURCE,
    Destination: {
      ToAddresses: [recipient]
    },
    Message: {
      Body: {
        Text: {
          Data: body
        }
      },
      Subject: {
        Data: subject
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(result);
  } catch (e) {
    console.error(e);
  }
};

export const handler = sendMail;
