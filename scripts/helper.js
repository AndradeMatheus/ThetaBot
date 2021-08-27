const handleDeleteMessage = async (msg, timeRange) => {
    setTimeout(function(){msg.delete()}, timeRange);
}

module.exports = {
    handleDeleteMessage
}