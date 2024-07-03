/**
 * 这个函数用于将给定的字符串转换为对应的十六进制颜色值。
 * 如果字符串是一个六位的十六进制颜色值（例如，#ffffff或0xffffff），则直接返回该值。
 * 如果字符串是一个RGB颜色值（例如，rgb(255, 255, 255)），则将每个颜色分量转换为十六进制，
 * 并组合成一个六位的十六进制颜色值返回。如果字符串是一个三位的十六进制颜色值（例如，fff），
 * 则将每个字符重复一次，组合成一个六位的十六进制颜色值返回。
 * 如果字符串不符合以上任何一种格式，则返回false。
 * @param string
 * @return {boolean|string}
 */
export default function( string ) {

    let match, result;

    if ( match = string.match( /(#|0x)?([a-f0-9]{6})/i ) ) {

        result = match[ 2 ];

    } else if ( match = string.match( /rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/ ) ) {

        result = parseInt( match[ 1 ] ).toString( 16 ).padStart( 2, 0 )
            + parseInt( match[ 2 ] ).toString( 16 ).padStart( 2, 0 )
            + parseInt( match[ 3 ] ).toString( 16 ).padStart( 2, 0 );

    } else if ( match = string.match( /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i ) ) {

        result = match[ 1 ] + match[ 1 ] + match[ 2 ] + match[ 2 ] + match[ 3 ] + match[ 3 ];

    }

    if ( result ) {
        return '#' + result;
    }

    return false;

}