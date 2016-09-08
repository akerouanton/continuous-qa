export default function (req, res, next, urn) {
  if (/^urn:[a-z0-9][a-z0-9-]{0,31}:[a-z0-9()+,\-.:=@;$_!*'%/?#]+$/.test(urn)) {
    next();
    return;
  }

  res.status(400).json({error: 'UrnNotValid'});
}
