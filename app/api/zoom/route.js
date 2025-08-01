
import { KJUR } from 'jsrsasign';

const inNumberArray = (arr) => (value) => arr.includes(value);
const isBetween = (min, max) => (value) =>
  typeof value === 'number' && value >= min && value <= max;
const isRequiredAllOrNone = (fields) => (body) => {
  const present = fields.filter((f) => f in body);
  return present.length === 0 || present.length === fields.length;
};
const validateRequest = (
  body,
  propValidators,
  schemaValidators
) => {
  const errors= [];

  for (const key in propValidators) {
    if (body[key] !== undefined && !propValidators[key](body[key])) {
      errors.push(`${key} is invalid`);
    }
  }

  schemaValidators.forEach((validator) => {
    if (!validator(body)) {
      errors.push('Missing required fields: ' + JSON.stringify(body));
    }
  });

  return errors;
};

const propValidations = {
  role: inNumberArray([0, 1]),
  expirationSeconds: isBetween(1800, 172800),
  videoWebRtcMode: inNumberArray([0, 1]),
};

const schemaValidations = [isRequiredAllOrNone(['meetingNumber', 'role'])];

const coerceRequestBody = (body) => ({
  ...body,
  ...['role', 'expirationSeconds', 'videoWebRtcMode'].reduce(
    (acc, cur) => ({
      ...acc,
      [cur]: typeof body[cur] === 'string' ? parseInt(body[cur], 10) : body[cur],
    }),
    {}
  ),
});

export default function POST(req, res) {
 

  const requestBody = coerceRequestBody(req.body);
  const validationErrors = validateRequest(requestBody, propValidations, schemaValidations);

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const { meetingNumber, role, expirationSeconds, videoWebRtcMode } = requestBody;

  const iat = Math.floor(Date.now() / 1000);
  const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2;

  const oHeader = { alg: 'HS256', typ: 'JWT' };
  const oPayload = {
    appKey: process.env.ZOOM_MEETING_SDK_KEY,
    sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp,
  };

  if (videoWebRtcMode !== undefined) {
    oPayload.video_webrtc_mode = videoWebRtcMode;
  }

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const signature = KJUR.jws.JWS.sign(
    'HS256',
    sHeader,
    sPayload,
    process.env.ZOOM_MEETING_SDK_SECRET
  );

  return NextResponse.status(200).json({
    signature,
    sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
  });
}
