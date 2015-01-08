/*
  Data Normalization Procedures
  ---
  Map & munge data
*/

exports.bet = function ( bet, meta ) {
  return prefixType( 'bet', bet, meta );
};

/* Private */
function prefixType ( type, data, meta ) {
  var o = {};

  o[ type ] = data;

  if( meta ) {
    o.meta = meta;
  }

  return o;
}
