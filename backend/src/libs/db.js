import moose from 'mongoose';

export const connectDB = async () => {
    try{
        await moose.connect(process.env.MONGODB_CONNECTIONSTRING)
        console.log('Liên kết CSDL thành công')
    } catch (error) {
        console.log('Lỗi khi kết nối CSDL: ', error)
        process.exit(1)
    }
};