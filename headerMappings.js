var mappings = {};

mappings['headerEnd'] = {
    id: 0x00,
    getParams: function(args){
        return [[]];
    }
};

mappings['setMem'] = {
    id: 0x01,
    getParams: function(args){
        return [
            [
                parseInt(args[0]),
                4
            ]
        ];
    }
};

module.exports = mappings;